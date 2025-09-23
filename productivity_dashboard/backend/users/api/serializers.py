from dataclasses import fields
import email
from rest_framework import serializers
from django.contrib.auth import authenticate
from ..models import PaymentMethod, Subscription, User, UserActivity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'timezone', 'profile_pic',
            'is_premium', 'is_active', 'date_joined'
            ]
        read_only_fields = ['is_premium', 'is_active', 'date_joined']

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['last_login', 'ip_address']
        read_only_fields = fields

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email = data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required = True)
    class Meta:
        model = User
        fields = [ 'email', 'password', 'timezone', 'profile_pic']
        extra_kwargs ={
            'password': {'write_only': True}
        }

    def create(self, validate_data):
        return User.objects.create_user(
            email = validate_data['email'],
            password = validate_data.pop('password')
            **validate_data
        )

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'phone_number', 'mpesa_reciept', 'is_default','added_at'
        ]
        read_only_fields = ['id', 'added_at', 'mpesa_reciept']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'renews_on'
        ]
        read_only_fields = ['id', 'added_at']


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = [
            'plan'
        ]


