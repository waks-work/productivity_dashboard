from rest_framework import serializers
from .models import Task, TaskNote

class TaskSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'priority', 'priority_display', 'status', 'status_display', 'description','deadline', 'created_at']

        read_only_fields = [
            'id',
            'user',
            'user_email',
            'created_at',
            'status_display',
            'priority_display'
        ]

class TaskNoteSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = TaskNote
        fields = [
            'id',
            'task',
            'user',
            'user_email',
            'content',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'user',
            'user_email',
            'created_at',
            'updated_at'
        ]

