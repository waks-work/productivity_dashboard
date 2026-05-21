from django.conf import settings
from django.db import models
#from backend.backend import settings
#from django.contrib.auth.models import User

from productivity_dashboard.backend.backend import settings

class Task(models.Model):
    PRIORITY_CHOICES= [
        ("LOW","Low"),
        ("MEDIUM","Medium"),
        ("HIGH", "High")
    ]
    STATUS_CHOICES = [
        ("TODO","Todo"),
        ("PROGRESS","In Progress"),
        ("DONE","Done")
        ]

    user =models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name= 'tasks'
        )
    title = models.CharField(max_length=200)
    priority = models.CharField(max_length=20, choices =PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices = STATUS_CHOICES)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'taskmanager'

    def __str__(self) -> str:
        return self.title
