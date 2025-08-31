from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from typing import Optional, List
from django.db import transaction, models
from rest_framework.views import APIView

from .models import (
    Classroom, ClassMembership,
    Team, TeamMembership,
    Task, Assignment,
    Submission, Score
)
from .serializers import (
    UserSerializer, RegisterSerializer,
    ClassroomSerializer, ClassMembershipSerializer,
    TeamSerializer, TeamMembershipSerializer,
    TaskSerializer, AssignmentSerializer,
    SubmissionSerializer, ScoreSerializer
)
from .permissions import IsTeacher, IsStudent

User = get_user_model()


# -----------------------------
# Регистрация
# -----------------------------
class RegisterViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST /api/auth/register
    {
      "username": "alice",
      "email": "alice@example.com",
      "full_name": "Alice A.",
      "role": "TEACHER" | "STUDENT",
      "password": "********"
    }
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]



# -----------------------------
# Пользователи (чтение и частичное обновление)
# -----------------------------
class UserViewSet(mixins.RetrieveModelMixin,
                  mixins.ListModelMixin,
                  mixins.UpdateModelMixin,
                  viewsets.GenericViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# -----------------------------
# Классы и участники
# -----------------------------
class ClassroomViewSet(viewsets.ModelViewSet):
    """
    CRUD классов. Создавать/менять может только учитель.
    """
    queryset = Classroom.objects.select_related('teacher').all().order_by('-created_at')
    serializer_class = ClassroomSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsTeacher()]

    @action(methods=['post'], detail=False, permission_classes=[IsAuthenticated, IsStudent])
    @transaction.atomic
    def join_by_code(self, request):
        """
        POST /api/classrooms/join_by_code
        Body: {"code": "AB12CD"}
        Логика: студент вводит код → добавляем в класс (если не добавлен).
        """
        code = str(request.data.get('code', '')).strip()
        if not code:
            return Response({'detail': 'Требуется code'}, status=400)

        try:
            classroom = Classroom.objects.select_for_update().get(code=code)
        except Classroom.DoesNotExist:
            return Response({'detail': 'Неверный код класса'}, status=404)

        # Проверим, не состоит ли уже
        exists = ClassMembership.objects.filter(classroom=classroom, student=request.user).exists()
        if exists:
            return Response({'detail': 'Вы уже состоите в этом классе'}, status=200)

        ClassMembership.objects.create(classroom=classroom, student=request.user)
        return Response({'detail': f'Вы присоединились к классу {classroom.name}', 'classroomId': classroom.id}, status=201)

    @action(methods=['post'], detail=True, permission_classes=[IsAuthenticated, IsTeacher])
    @transaction.atomic
    def add_student(self, request, pk=None):
        """
        (Опционально) Учитель может добавить студента в класс по username/email.
        POST /api/classrooms/{id}/add_student
        Body: {"username": "bob"}  или {"email": "bob@example.com"}
        """
        classroom = self.get_object()
        username = request.data.get('username')
        email = request.data.get('email')

        if not username and not email:
            return Response({'detail': 'Укажите username или email'}, status=400)

        try:
            if username:
                student = User.objects.get(username=username, role='STUDENT')
            else:
                student = User.objects.get(email=email, role='STUDENT')
        except User.DoesNotExist:
            return Response({'detail': 'Ученик не найден'}, status=404)

        if ClassMembership.objects.filter(classroom=classroom, student=student).exists():
            return Response({'detail': 'Ученик уже в классе'}, status=200)

        ClassMembership.objects.create(classroom=classroom, student=student)
        return Response({'detail': f'Ученик {student.username} добавлен.'}, status=201)


class ClassMembershipViewSet(viewsets.ModelViewSet):
    """
    Добавление ученика в класс. Доступно учителю класса.
    Для простоты — базовая проверка прав (в реале: IsClassTeacher).
    """
    queryset = ClassMembership.objects.select_related('classroom', 'student').all()
    serializer_class = ClassMembershipSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# -----------------------------
# Команды и участники команды
# -----------------------------
class TeamViewSet(viewsets.ModelViewSet):
    """
    Учитель управляет командами внутри класса.
    """
    queryset = Team.objects.select_related('classroom').all().order_by('-created_at')
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    @action(methods=['post'], detail=True, permission_classes=[IsAuthenticated, IsTeacher])
    @transaction.atomic
    def set_members(self, request, pk=None):
        """
        POST /api/teams/{id}/set_members
        Body: {"studentIds": [1,2,3], "captainId": 2 (optional)}
        Полностью перезаписывает состав команды.
        """
        team = self.get_object()
        student_ids = request.data.get('studentIds', [])
        captain_id = request.data.get('captainId')

        # Проверка: все ученики принадлежат тому же классу
        class_student_ids = set(
            ClassMembership.objects.filter(classroom=team.classroom).values_list('student_id', flat=True)
        )
        if not set(student_ids).issubset(class_student_ids):
            return Response({'detail': 'Все ученики должны состоять в том же классе'}, status=400)

        # Пересоздаём состав
        TeamMembership.objects.filter(team=team).delete()

        members_to_create = []
        for sid in student_ids:
            role = 'CAPTAIN' if (captain_id and sid == int(captain_id)) else 'MEMBER'
            members_to_create.append(TeamMembership(team=team, student_id=sid, role_in_team=role))
        TeamMembership.objects.bulk_create(members_to_create)

        return Response({'detail': 'Состав обновлён', 'count': len(members_to_create)}, status=200)


class TeamMembershipViewSet(viewsets.ModelViewSet):
    queryset = TeamMembership.objects.select_related('team', 'student', 'team__classroom').all()
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# -----------------------------
# Задачи
# -----------------------------
class TaskViewSet(viewsets.ModelViewSet):
    """
    Учитель создаёт задачи. Чтение — всем аутентифицированным.
    Для автоподбора по «уровням» используйте тег-метки "L{n}".
    """
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsTeacher()]


class AssignmentViewSet(viewsets.ModelViewSet):
    """
    Базовый CRUD по выдачам (чаще всего нужен для просмотра).
    Создание массово делает /api/battles/launch.
    """
    queryset = Assignment.objects.select_related('task', 'team', 'classroom', 'assigned_by').all().order_by('-created_at')
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class ScoreViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    """
    Просмотр очков (по умолчанию — сортировка по убыванию total_points).
    """
    queryset = Score.objects.select_related('student', 'team', 'classroom').all().order_by('-total_points')
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]



# -----------------------------
# Отправка решения и начисление очков
# -----------------------------
class SubmissionViewSet(mixins.CreateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        viewsets.GenericViewSet):
    """
    POST /api/submissions
    {
      "assignment": 1001,
      "student": 7,                     # обычно берём из токена, но оставим валидацию
      "answer_payload": {"answer": "42"},
      "attempt_no": 1
    }
    → Проверяем, выставляем is_correct/feedback/points_awarded,
      обновляем Score в контексте team (и/или класса/глобально — по вашему правилу).
    """
    queryset = Submission.objects.select_related(
        'assignment', 'assignment__task', 'assignment__team', 'assignment__classroom', 'student'
    ).all().order_by('-created_at')
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsStudent()]
        return super().get_permissions()

    @transaction.atomic
    def perform_create(self, serializer):
        # 1) Сохраняем отправку
        submission: Submission = serializer.save()

        # 2) Безопасность: студент может отправлять ответы ТОЛЬКО за себя
        if submission.student_id != self.request.user.id:
            # можно ещё строго запретить передачу student в body и подставлять request.user
            raise PermissionError("Нельзя отправлять ответ от имени другого пользователя")

        # 3) Простейшая проверка (замените на ваш чекер)
        task = submission.assignment.task
        expected = (task.expected_answer or '').strip()

        payload = submission.answer_payload
        if isinstance(payload, dict) and 'answer' in payload:
            value = str(payload['answer']).strip()
        else:
            value = str(payload).strip()

        is_correct = False
        feedback = ''
        points = 0

        if expected:
            is_correct = (value == expected)
            feedback = 'Верно!' if is_correct else f'Неверно. Ожидается: {expected}'
        else:
            # Если solution_spec, тут может быть сложная проверка
            feedback = 'Ответ принят. Настроек проверки нет (expected_answer пуст).'

        if is_correct:
            # Базовое начисление: максимум из задачи
            # Можно модифицировать формулой (за попытки/скорость/стрейки и т.д.)
            points = int(task.max_points)

        # 4) Обновляем сам Submission
        submission.is_correct = is_correct
        submission.feedback = feedback
        submission.checked_at = timezone.now()
        submission.points_awarded = points
        submission.save(update_fields=['is_correct', 'feedback', 'checked_at', 'points_awarded'])

        # 5) Начисляем очки студенту в контексте команды (и/или класса/глобально)
        self._bump_score(student_id=submission.student_id,
                         classroom_id=submission.assignment.classroom_id,
                         team_id=submission.assignment.team_id,
                         delta_points=points)

        # --- Отправка обновления через сокеты ---
        # Получаем battle_id (если есть связь с битвой)
        # В данной структуре Assignment не содержит battle, поэтому используем team_id как идентификатор битвы
        battle_id = submission.assignment.team_id
        if battle_id:
            channel_layer = get_channel_layer()
            payload = {
                "type": "battle.update",
                "message": {
                    "student_id": submission.student_id,
                    "points": points,
                    "is_correct": is_correct,
                    "feedback": feedback
                }
            }
            async_to_sync(channel_layer.group_send)(f"battle_{battle_id}", payload)

    # --- helpers ---

    def _bump_score(self, student_id: int, classroom_id: Optional[int], team_id: Optional[int], delta_points: int):
        """
        Обновляет агрегат Score. Используем UPDATE с F-выражением для атомарности.
        (Если записи нет — создаём с нулём, затем инкрементим.)
        """
        if delta_points == 0:
            return

        # Пробуем обновить существующую
        updated = Score.objects.filter(
            student_id=student_id,
            classroom_id=classroom_id,
            team_id=team_id
        ).update(
            total_points=models.F('total_points') + delta_points,
            last_update=timezone.now()
        )

        if updated == 0:
            # Создадим запись, затем ещё раз инкрементим, чтобы не потерять очки в гонке
            Score.objects.create(
                student_id=student_id,
                classroom_id=classroom_id,
                team_id=team_id,
                total_points=0,
                last_update=timezone.now()
            )
            Score.objects.filter(
                student_id=student_id,
                classroom_id=classroom_id,
                team_id=team_id
            ).update(
                total_points=models.F('total_points') + delta_points,
                last_update=timezone.now()
            )



# -----------------------------
# Счета (только просмотр)
# -----------------------------
class ScoreViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    queryset = Score.objects.select_related('student', 'classroom', 'team').all().order_by('-total_points')
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]

class BattleView(APIView):
    """
    POST /api/battles/launch
    Body: {"teamId": 123, "dueAt": "2025-09-30T18:00:00Z" (optional)}
    Доступ: учитель класса.
    Эффект: для каждого участника команды создаётся Assignment с задачей, подобранной под его "уровень".
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    @transaction.atomic
    def post(self, request):
        team_id = request.data.get('teamId')
        due_at = request.data.get('dueAt')  # строка ISO или None

        if not team_id:
            return Response({'detail': 'Требуется teamId'}, status=400)

        try:
            team = Team.objects.select_related('classroom').get(id=team_id)
        except Team.DoesNotExist:
            return Response({'detail': 'Команда не найдена'}, status=404)

        # Проверка, что текущий пользователь — учитель этого класса
        if team.classroom.teacher_id != request.user.id:
            return Response({'detail': 'Доступ запрещён: вы не учитель этого класса'}, status=403)

        # Получаем участников команды
        member_ids: List[int] = list(
            TeamMembership.objects.filter(team=team).values_list('student_id', flat=True)
        )
        if not member_ids:
            return Response({'detail': 'В команде нет участников'}, status=400)

        # Подбор задач и создание персональных Assignment
        created = []
        for student_id in member_ids:
            # 1) Определим «очки» в контексте команды/класса/глобально
            pts = _get_student_points(student_id, team.classroom_id, team.id)

            # 2) Вычислим «уровень»
            level = _points_to_level(pts)

            # 3) Найдём подходящую задачу по тегу L{level}
            task = _pick_task_for_level(level)
            if not task:
                return Response({'detail': f'Нет подходящих задач для уровня {level}'}, status=409)

            # 4) Создадим персонифицированную выдачу
            a = Assignment.objects.create(
                task=task,
                classroom=None,          # битва конкретной команды
                team=team,
                assigned_by=request.user,
                due_at=due_at
            )
            created.append(a.id)

        return Response({'detail': 'Битва запущена', 'assignments': created}, status=201)


# ---- Вспомогательные функции подбора ----

def _get_student_points(student_id: int, classroom_id: int, team_id: int) -> int:
    """
    Возвращает текущие очки студента: сперва смотрим Score по team,
    затем по classroom, затем глобально (оба None).
    """
    # team-контекст
    sc = Score.objects.filter(student_id=student_id, team_id=team_id).first()
    if sc:
        return sc.total_points

    # class-контекст
    sc = Score.objects.filter(student_id=student_id, classroom_id=classroom_id, team__isnull=True).first()
    if sc:
        return sc.total_points

    # глобальный (ни team, ни classroom)
    sc = Score.objects.filter(student_id=student_id, classroom__isnull=True, team__isnull=True).first()
    return sc.total_points if sc else 0


def _points_to_level(points: int) -> int:
    """
    Простейшая формула уровня из очков: каждые 100 очков = +1 уровень.
    Минимум 1.
    """
    return max(1, 1 + (points // 100))


def _pick_task_for_level(level: int) -> Optional[Task]:
    """
    Ищем задачу по тегу 'L{level}'. Если не нашли — мягкие фоллбеки:
    - L{level+1}, L{level-1}, ... в радиусе 3
    - иначе берём по сложности (EASY/MEDIUM/HARD) как эвристика
    """
    tag = f"L{level}"
    task = Task.objects.filter(tags__contains=[tag]).order_by('-created_at').first()
    if task:
        return task

    # Радиус поиска по соседним уровням
    for delta in [1, -1, 2, -2, 3, -3]:
        t = Task.objects.filter(tags__contains=[f"L{level+delta}"]).order_by('-created_at').first()
        if t:
            return t

    # Fallback: по сложности — чем выше уровень, тем сложнее
    if level <= 2:
        diff = 'EASY'
    elif level <= 5:
        diff = 'MEDIUM'
    else:
        diff = 'HARD'
    return Task.objects.filter(difficulty=diff).order_by('-created_at').first()

