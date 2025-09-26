from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PromptViewSet, AuditLogViewSet, GuardrailsConfigViewSet

app_name = 'prompts'

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'', PromptViewSet, basename='prompt')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'guardrails-configs', GuardrailsConfigViewSet, basename='guardrails-config')

urlpatterns = [
    path('', include(router.urls)),
]
