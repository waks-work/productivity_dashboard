from taskmanager.models import Task

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated

from .models import UserActivityLog, ProductivityMetric
from .serializers import UserActivitySerializer, ProductivityMetricSerializer


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserActivityLog.objects.filter(user=self.request.user)


class ProductivityMetricsView(generics.RetrieveAPIView):
    serializer_class = ProductivityMetricSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        metric, _ = ProductivityMetric.objects.get_or_create(user=self.request.user)
        return metric
