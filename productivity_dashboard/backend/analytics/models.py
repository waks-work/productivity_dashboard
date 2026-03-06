from django.db import models
from django.conf import settings

class UserActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete= models.CASCADE)
    endpoint =models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    status_code = models.PositiveIntegerField()
    response =models.FloatField()
    created_at = models.DateTimeField(auto_now_add =True)

    class Meta:
        ordering = [ "-created_at"]

class ProductivityMetric(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete= models.CASCADE)
    task_completed = models.PositiveIntegerField(default=0)
    focus_sessions = models.PositiveIntegerField(default=0)
    efficiency_scores = models.FloatField(default =0.0)
    last_updated= models.DateTimeField(auto_now_add=True)
