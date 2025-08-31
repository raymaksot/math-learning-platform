from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsTeacher(BasePermission):
    """Разрешение только для учителя (role=TEACHER)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'TEACHER')


class IsStudent(BasePermission):
    """Разрешение только для ученика (role=STUDENT)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')


class ReadOnly(BasePermission):
    """Разрешает только чтение."""
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
