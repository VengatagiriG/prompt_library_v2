import os
import django
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_library.settings')
django.setup()

from django.contrib.auth.models import User

def create_users():
    # Create admin user
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print('Admin user created')

    # Create regular user
    user, created = User.objects.get_or_create(
        username='user',
        defaults={'email': 'user@example.com', 'first_name': 'John', 'last_name': 'Doe'}
    )
    if created:
        user.set_password('user123')
        user.save()
        print('Regular user created')

    print('Users created successfully')

if __name__ == '__main__':
    create_users()
