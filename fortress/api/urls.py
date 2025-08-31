from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .report_views import ClassOverviewReportView, StudentReportView, ReportExportView

from .views import (
    RegisterViewSet,
    ClassroomViewSet, TeamViewSet,
    TaskViewSet, AssignmentViewSet,
    SubmissionViewSet, ScoreViewSet,
    BattleView
)

router = DefaultRouter()
# Регистрация
router.register(r'auth/register', RegisterViewSet, basename='auth-register')

# Классы и команды
router.register(r'classrooms', ClassroomViewSet, basename='classrooms')
router.register(r'teams', TeamViewSet, basename='teams')

# Задачи, выдачи, ответы, очки
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'assignments', AssignmentViewSet, basename='assignments')
router.register(r'submissions', SubmissionViewSet, basename='submissions')
router.register(r'scores', ScoreViewSet, basename='scores')

urlpatterns = [
    # Основные CRUD-роуты
    path('', include(router.urls)),

    # JWT вход и обновление
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Запуск битвы (массовая выдача задач)
    path('battles/launch', BattleView.as_view(), name='battle_launch'),
    path('reports/class/<int:class_id>/overview', ClassOverviewReportView.as_view(), name='report_class_overview'),
    path('reports/student/<int:student_id>', StudentReportView.as_view(), name='report_student'),
    path('reports/export', ReportExportView.as_view(), name='report_export'),
]