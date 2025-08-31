from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Classroom, ClassMembership, Team, TeamMembership, Task, Assignment, Submission, Score

User = get_user_model()


# -----------------------------
# Пользователь
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'role', 'is_active', 'date_joined')
        read_only_fields = ('id', 'is_active', 'date_joined')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Регистрация пользователя (пароль пишется отдельно для хеширования).
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'role', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# -----------------------------
# Класс
# -----------------------------
class ClassroomSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Classroom
        fields = ('id', 'name', 'teacher', 'code', 'created_at')
        read_only_fields = ('id', 'created_at')


class ClassMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassMembership
        fields = ('id', 'classroom', 'student', 'joined_at')
        read_only_fields = ('id', 'joined_at')


# -----------------------------
# Команда
# -----------------------------
class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'classroom', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')


class TeamMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMembership
        fields = ('id', 'team', 'student', 'role_in_team', 'joined_at')
        read_only_fields = ('id', 'joined_at')


# -----------------------------
# Задача
# -----------------------------
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            'id', 'title', 'body_md', 'difficulty', 'tags',
            'max_points', 'expected_answer', 'solution_spec', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


# -----------------------------
# Выдача
# -----------------------------
class AssignmentSerializer(serializers.ModelSerializer):
    """
    Валидируем, что указано либо classroom, либо team.
    """
    class Meta:
        model = Assignment
        fields = ('id', 'task', 'classroom', 'team', 'assigned_by', 'due_at', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        classroom = attrs.get('classroom')
        team = attrs.get('team')
        if bool(classroom) == bool(team):
            raise serializers.ValidationError('Нужно выбрать либо classroom, либо team.')
        return attrs


# -----------------------------
# Отправка решения
# -----------------------------
class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = (
            'id', 'assignment', 'student', 'answer_payload',
            'attempt_no', 'is_correct', 'feedback', 'checked_at',
            'points_awarded', 'created_at'
        )
        read_only_fields = ('id', 'is_correct', 'feedback', 'checked_at', 'points_awarded', 'created_at')


# -----------------------------
# Очки
# -----------------------------
class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ('id', 'student', 'classroom', 'team', 'total_points', 'last_update')
        read_only_fields = ('id', 'total_points', 'last_update')
