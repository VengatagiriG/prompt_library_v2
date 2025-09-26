"""
URL configuration for prompt_library project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet

def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Welcome to Prompt Library API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'auth': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
                'refresh': '/api/auth/refresh/',
                'profile': '/api/auth/me/',
            },
            'prompts': '/api/prompts/',
            'categories': '/api/prompts/categories/',
            'users': '/api/users/',
        }
    })

# DRF router for users endpoints under /api/users/
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include('users.urls')),
        path('prompts/', include('prompts.urls')),
    ])),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Mount router-generated endpoints under /api/
    path('api/', include(router.urls)),
]
