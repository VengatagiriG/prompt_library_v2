from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, LoginView, RegisterView

app_name = 'users'

urlpatterns = [
    # Auth endpoints under /api/auth/
    path('login/', LoginView.as_view(), name='auth_login'),
    path('login', LoginView.as_view()),  # no trailing slash variant
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('register', RegisterView.as_view()),  # no trailing slash variant
    path('me/', UserViewSet.as_view({'get': 'me'}), name='auth_me'),
    path('me', UserViewSet.as_view({'get': 'me'})),  # no trailing slash variant
]
