from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.http import JsonResponse
from django.conf import settings
import stripe
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    PaymentMethodSerializer,
    SubscriptionSerializer,
    SubscriptionUpdateSerializer
)
from ..models import PaymentMethod, Subscription, User

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubscriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'post']

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return SubscriptionUpdateSerializer
        return SubscriptionSerializer

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def create(self, request):
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': settings.STRIPE_PREMIUM_PRICE_ID,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=settings.FRONTEND_URL + '/subscribe/success/',
                cancel_url=settings.FRONTEND_URL + '/subscribe/cancel/',
                customer_email=request.user.email,
            )
            return Response({'session_id': checkout_session.id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        instance = self.get_object()
        serializer.save()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upgrade_to_premium(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_premium = True
        user.save()

        # Create/update subscription record
        Subscription.objects.update_or_create(
            user=user,
            defaults={
                'plan': 'premium',
                'status': 'active'
            }
        )

        return Response({"status": "success"})
    except User.DoesNotExist:
        return Response({"error": "User Not Found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_details(request):
    return JsonResponse({
        'username': request.user.username,
        'email': request.user.email,
        'id': request.user.id
    })

