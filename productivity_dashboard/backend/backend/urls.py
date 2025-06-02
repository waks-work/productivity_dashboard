from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('taskmanager.urls')),
    path('api/users' , include('users.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/auth/login/', obtain_auth_token, name='api-token-auth'),
]
