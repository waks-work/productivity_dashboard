from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    PaymentMethodViewSet,
    SubscriptionViewSet,
    upgrade_to_premium,
    user_details
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'payment-methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('api/auth/user/', user_details, name='user-details'),

    # Admin-only endpoint
    path('admin/upgrade-premium/<int:user_id>/', upgrade_to_premium, name='upgrade-premium'),

    # Include ViewSet URLs
    path('', include(router.urls)),
]