"""
Custom password validator for enhanced security
"""

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re


class CustomPasswordValidator:
    """
    Custom password validator with enhanced security requirements
    """

    def validate(self, password, user=None):
        errors = []

        # Check for minimum length
        if len(password) < 12:
            errors.append("Password must be at least 12 characters long.")

        # Check for uppercase letters
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter.")

        # Check for lowercase letters
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter.")

        # Check for numbers
        if not re.search(r'[0-9]', password):
            errors.append("Password must contain at least one number.")

        # Check for special characters
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>?]', password):
            errors.append("Password must contain at least one special character.")

        # Check for common patterns
        if re.search(r'(123|abc|qwerty|password|admin|user)', password.lower()):
            errors.append("Password must not contain common patterns or words.")

        # Check for repeated characters
        if re.search(r'(.)\1{2,}', password):
            errors.append("Password must not contain repeated characters (3 or more).")

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Your password must be at least 12 characters long and contain "
            "uppercase letters, lowercase letters, numbers, and special characters. "
            "It must not contain common patterns or repeated characters."
        )
