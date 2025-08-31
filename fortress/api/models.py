from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


# -----------------------------
# Пользователь
# -----------------------------
class User(AbstractUser):
    """
    Кастомная модель пользователя.
    Наследуемся от AbstractUser (сохраняем username), добавляем роль и ФИО.
    При желании можно перейти на AbstractBaseUser и логин по email.
    """
    class Role(models.TextChoices):
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        ADMIN   = 'ADMIN',   'Admin'

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.STUDENT)
    full_name = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'{self.username} ({self.role})'


# -----------------------------
# Класс (учебная группа)
# -----------------------------
class Classroom(models.Model):
    """
    Учебный класс/группа, принадлежит одному учителю.
    """
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(User, on_delete=models.PROTECT, related_name='classes')
    code = models.CharField(max_length=12, unique=True, help_text='Код-приглашение для присоединения к классу')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Classroom({self.name})'


class ClassMembership(models.Model):
    """
    Связь: Пользователь (ученик) состоит в классе.
    """
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='class_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classroom', 'student')


# -----------------------------
# Команда
# -----------------------------
class Team(models.Model):
    """
    Команда внутри класса.
    """
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classroom', 'name')

    def __str__(self):
        return f'Team({self.name} @ {self.classroom.name})'


class TeamMembership(models.Model):
    """
    Связь: Ученик состоит в команде.
    """
    class RoleInTeam(models.TextChoices):
        MEMBER = 'MEMBER', 'Member'
        CAPTAIN = 'CAPTAIN', 'Captain'

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    role_in_team = models.CharField(max_length=16, choices=RoleInTeam.choices, default=RoleInTeam.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('team', 'student')


# -----------------------------
# Задача
# -----------------------------
class Task(models.Model):
    """
    Математическая задача. Тело храним в Markdown.
    Для простой проверки предусмотрен expected_answer (например, число/строка).
    Более сложные проверки можно описывать в solution_spec (JSON).
    """
    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    title = models.CharField(max_length=255)
    body_md = models.TextField()
    difficulty = models.CharField(max_length=16, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    tags = models.JSONField(default=list, blank=True)  # список тегов
    max_points = models.PositiveIntegerField(default=10)
    expected_answer = models.CharField(max_length=255, blank=True, help_text='Простой правильный ответ (опционально)')
    solution_spec = models.JSONField(default=dict, blank=True)  # произвольные параметры проверки
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Task({self.title})'


# -----------------------------
# Выдача заданий (Assignment)
# -----------------------------
class Assignment(models.Model):
    """
    Выдача задачи на класс или команду.
    Ровно одно из полей (classroom или team) должно быть заполнено.
    """
    task = models.ForeignKey(Task, on_delete=models.PROTECT, related_name='assignments')
    classroom = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.PROTECT, related_name='assignments')
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.PROTECT, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='given_assignments')
    due_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Гарантируем, что выбрана одна и только одна аудитория
        if bool(self.classroom) == bool(self.team):
            from django.core.exceptions import ValidationError
            raise ValidationError('Assignment должен быть выдан либо на classroom, либо на team.')

    def __str__(self):
        target = self.classroom or self.team
        return f'Assignment({self.task.title} -> {target})'


# -----------------------------
# Отправленные ответы (Submission)
# -----------------------------
class Submission(models.Model):
    """
    Отправка решения студентом по конкретной выдаче.
    """
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    answer_payload = models.JSONField(default=dict)  # произвольная структура ответа
    attempt_no = models.PositiveIntegerField(default=1)
    is_correct = models.BooleanField(default=False)
    feedback = models.TextField(blank=True)
    checked_at = models.DateTimeField(null=True, blank=True)
    points_awarded = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['assignment', 'student']),
        ]


# -----------------------------
# Очки (агрегат по студенту в контексте класса/команды)
# -----------------------------
class Score(models.Model):
    """
    Денормализованный счёт.
    Можно хранить три измерения: студент, класс (опц.), команда (опц.).
    """
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='scores')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True, related_name='scores')

    total_points = models.IntegerField(default=0)
    last_update = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = (
            ('student', 'classroom', 'team'),
        )

    def __str__(self):
        dim = self.team or self.classroom or 'GLOBAL'
        return f'Score(student={self.student_id}, ctx={dim}, points={self.total_points})'
