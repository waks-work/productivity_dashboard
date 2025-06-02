from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserActivityViewSet, ProductivityMetricsView

router = DefaultRouter()
router.register(r'activity-logs', UserActivityViewSet, basename='activity-logs')

urlpatterns = [
    path('productivity-metrics/', ProductivityMetricsView.as_view(), name='productivity-metrics'),
] + router.urls