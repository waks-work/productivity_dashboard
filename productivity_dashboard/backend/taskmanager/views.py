from rest_framework import viewsets
from taskmanager.models import Task, TaskNote
from taskmanager.serializers import TaskNoteSerializer, TaskSerializer
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

class TaskNoteViewSet(viewsets.ModelViewSet):
    serializer_class = TaskNoteSerializer

    def get_queryset(self):
        return TaskNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

