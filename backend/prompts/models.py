from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
import uuid
from .managers import AuditLogManager


class Category(models.Model):
    """Model for prompt categories"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Prompt(models.Model):
    """Model for AI prompts with versioning support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='prompts')
    tags = models.JSONField(default=list, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prompts')
    is_favorite = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)
    last_used_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)  # Soft delete flag

    # Versioning fields
    current_version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

    def increment_usage(self):
        """Increment the usage count and update last_used_at"""
        from django.utils import timezone
        self.usage_count += 1
        self.last_used_at = timezone.now()
        self.save(update_fields=['usage_count', 'last_used_at'])

class PromptVersion(models.Model):
    """Model for tracking different versions of prompts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prompt = models.ForeignKey(Prompt, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prompt_versions')
    change_summary = models.TextField(blank=True, null=True)  # Description of what changed
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ['prompt', 'version_number']

    def __str__(self):
        return f"{self.prompt.title} v{self.version_number}"

    def save(self, *args, **kwargs):
        # Auto-increment version number if not provided
        if not self.version_number:
            last_version = self.prompt.versions.order_by('-version_number').first()
            self.version_number = (last_version.version_number if last_version else 0) + 1
        super().save(*args, **kwargs)


class AuditLog(models.Model):
    """Model for storing audit logs"""

    ACTION_CHOICES = [
        # Authentication actions
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('LOGIN_FAILED', 'Failed Login Attempt'),
        ('PASSWORD_CHANGE', 'Password Change'),
        ('PASSWORD_RESET', 'Password Reset'),

        # User management
        ('USER_CREATE', 'User Created'),
        ('USER_UPDATE', 'User Updated'),
        ('USER_DELETE', 'User Deleted'),
        ('PERMISSION_CHANGE', 'Permission Changed'),

        # Prompt management
        ('PROMPT_CREATE', 'Prompt Created'),
        ('PROMPT_UPDATE', 'Prompt Updated'),
        ('PROMPT_DELETE', 'Prompt Deleted'),
        ('PROMPT_VIEW', 'Prompt Viewed'),
        ('PROMPT_USE', 'Prompt Used'),

        # Category management
        ('CATEGORY_CREATE', 'Category Created'),
        ('CATEGORY_UPDATE', 'Category Updated'),
        ('CATEGORY_DELETE', 'Category Deleted'),

        # AI actions
        ('AI_SUGGESTION', 'AI Suggestion Generated'),
        ('AI_IMPROVEMENT', 'AI Improvement Applied'),
        ('AI_ANALYSIS', 'AI Analysis Performed'),

        # Security events
        ('SUSPICIOUS_ACTIVITY', 'Suspicious Activity Detected'),
        ('RATE_LIMIT_EXCEEDED', 'Rate Limit Exceeded'),
        ('UNAUTHORIZED_ACCESS', 'Unauthorized Access Attempt'),
        ('DATA_EXPORT', 'Data Export'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100, blank=True)  # e.g., 'prompt', 'category'
    resource_id = models.CharField(max_length=100, blank=True)  # ID of the resource

    # Generic foreign key for flexible resource linking
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=100, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    details = models.JSONField(default=dict, blank=True)  # Additional details as JSON
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    objects = AuditLogManager()

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['resource_type', 'resource_id', '-timestamp']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        user_info = f"{self.user.username}" if self.user else "Anonymous"
        return f"{user_info} - {self.action} - {self.timestamp}"

    @classmethod
    def log_user_action(cls, user, action, resource_type, resource_id=None,
                       details=None, ip_address=None, user_agent=None):
        """Create an audit log entry for user actions"""
        try:
            return cls.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent
            )
        except Exception as e:
            # Don't break the application if logging fails
            print(f"Failed to create audit log: {e}")
            return None


class GuardrailsConfig(models.Model):
    """Model for storing guardrails configurations"""

    CONFIG_TYPES = [
        ('input_validation', 'Input Validation'),
        ('output_moderation', 'Output Moderation'),
        ('conversation_control', 'Conversation Control'),
        ('content_filtering', 'Content Filtering'),
        ('custom_rules', 'Custom Rules')
    ]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    config_type = models.CharField(max_length=50, choices=CONFIG_TYPES)
    configuration = models.JSONField()  # Store the YAML config as JSON
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guardrails_configs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.config_type})"

    def activate(self):
        """Activate this guardrails configuration"""
        # Deactivate all other configs of the same type
        GuardrailsConfig.objects.filter(
            config_type=self.config_type,
            is_active=True
        ).update(is_active=False)

        self.is_active = True
        self.save()

    def get_yaml_config(self):
        """Convert JSON config back to YAML format"""
        import yaml
        return yaml.dump(self.configuration, default_flow_style=False)


class GuardrailsLog(models.Model):
    """Model for storing guardrails validation logs"""

    LOG_LEVELS = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical')
    ]

    ACTION_TYPES = [
        ('input_validation', 'Input Validation'),
        ('output_moderation', 'Output Moderation'),
        ('conversation_moderation', 'Conversation Moderation'),
        ('jailbreak_attempt', 'Jailbreak Attempt'),
        ('content_violation', 'Content Violation'),
        ('rate_limit', 'Rate Limit Exceeded')
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guardrails_logs'
    )
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    log_level = models.CharField(max_length=20, choices=LOG_LEVELS, default='info')
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)

    # Related objects
    prompt = models.ForeignKey(
        Prompt,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guardrails_logs'
    )

    # Request information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Results
    allowed = models.BooleanField(default=True)
    risk_level = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='low'
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action_type', '-timestamp']),
            models.Index(fields=['log_level', '-timestamp']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.action_type} - {self.log_level} - {self.timestamp}"

    @classmethod
    def log_validation(
        cls,
        user,
        action_type,
        message,
        details=None,
        prompt=None,
        ip_address=None,
        user_agent=None,
        allowed=True,
        risk_level='low',
        log_level='info'
    ):
        """Create a guardrails log entry"""
        try:
            return cls.objects.create(
                user=user,
                action_type=action_type,
                log_level=log_level,
                message=message,
                details=details or {},
                prompt=prompt,
                ip_address=ip_address,
                user_agent=user_agent,
                allowed=allowed,
                risk_level=risk_level
            )
        except Exception as e:
            # Don't break the application if logging fails
            logger.error(f"Failed to create guardrails log: {e}")
            return None
