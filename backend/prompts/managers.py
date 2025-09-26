"""
Custom managers for the prompts app
"""

from django.db import models
from django.utils import timezone


class AuditLogManager(models.Manager):
    """Manager for audit log operations"""

    def log_action(self, user, action, resource_type, resource_id=None,
                   details=None, ip_address=None, user_agent=None):
        """Create an audit log entry"""
        try:
            return self.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent,
                timestamp=timezone.now()
            )
        except Exception as e:
            # Log to console but don't break the application
            print(f"Failed to create audit log: {e}")
            return None

    def get_logs_for_user(self, user, limit=50):
        """Get audit logs for a specific user"""
        return self.filter(user=user).order_by('-timestamp')[:limit]

    def get_logs_for_resource(self, resource_type, resource_id, limit=50):
        """Get audit logs for a specific resource"""
        return self.filter(
            resource_type=resource_type,
            resource_id=resource_id
        ).order_by('-timestamp')[:limit]

    def get_security_logs(self, limit=100):
        """Get security-related logs"""
        security_actions = [
            'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE',
            'PERMISSION_CHANGE', 'USER_CREATE', 'USER_DELETE',
            'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED'
        ]
        return self.filter(action__in=security_actions).order_by('-timestamp')[:limit]
