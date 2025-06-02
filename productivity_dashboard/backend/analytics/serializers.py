from rest_framework import serializers
from .models import UserActivityLog, ProductivityMetric

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivityLog
        fields = ['endpoint', 'method', 'status', 'response_time','created_at']

class ProductivityMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductivityMetric
        fields = '__all__'
        read_only_fields = ['users', 'load_updated']

