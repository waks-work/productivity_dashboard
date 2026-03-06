from taskmanager.models import Task

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated

from .models import UserActivityLog, ProductivityMetric
from .serializers import UserActivitySerializer, ProductivityMetricSerializer


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    queryset = UserActivityLog.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class ProductivityMetricsView(generics.RetrieveAPIView):
    serializer_class = ProductivityMetricSerializer
    permission_classes = [IsAuthenticated]
    queryset = ProductivityMetric.objects.all()

    def get_object(self):
        """
        Overriding to ignore URL 'pk' and fetch by session user.
        """
        metric, _ = ProductivityMetric.objects.get_or_create(user=self.request.user)
        # when overriding get_object
        self.check_object_permissions(self.request, metric)
        return metric

