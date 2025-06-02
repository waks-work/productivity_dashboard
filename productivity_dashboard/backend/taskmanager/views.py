from rest_framework import viewsets
from taskmanager.models import Task
from taskmanager.serializers import TaskSerializer
from django.contrib.auth import get_user_model


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    #SEEING ONLY THEIR TASKS
    def get_queryset(self):
        User = get_user_model()
        user = self.request.user
        return Task.objects.filter(user=user)

    #ASSIGNING THE USER TO THE TASK
    def perform_create(self, serializer):
        serializer.save(user =self.request.user)


