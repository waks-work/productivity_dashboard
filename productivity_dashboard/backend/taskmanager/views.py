from rest_framework import viewsets
from taskmanager.models import Journal, QuickNote, Task, TaskNote, WhiteBoard
from taskmanager.serializers import JournalSerializer, QuickNoteSerializer, TaskNoteSerializer, TaskSerializer, WhiteboardSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated

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

class QuickNoteViewSet(viewsets.ModelViewSet):
    serializer_class = QuickNoteSerializer

    def get_queryset(self):
        return QuickNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WhiteboardViewSet(viewsets.ModelViewSet):
    serializer_class = WhiteboardSerializer

    def get_queryset(self):
        return WhiteBoard.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JournalViewSet(viewsets.ModelViewSet):
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Journal.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
