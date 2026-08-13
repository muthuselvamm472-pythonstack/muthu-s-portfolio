"""
Django Management Command: set_admin_credentials
Usage: python manage.py set_admin_credentials <username> <password>
Sets or creates superuser admin username and password in DB.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Sets or updates the admin superuser username and password.'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='New Admin Username')
        parser.add_argument('password', type=str, help='New Admin Password')

    def handle(self, *args, **options):
        username = options['username'].strip()
        password = options['password'].strip()

        if not username or not password:
            self.stderr.write(self.style.ERROR('Username and password cannot be empty.'))
            return

        # Find existing target user or primary admin
        existing_target = User.objects.filter(username=username).first()
        primary_admin = User.objects.filter(is_superuser=True).first() or User.objects.filter(is_staff=True).first()

        if existing_target:
            user = existing_target
            # Delete other duplicate staff users
            for other in User.objects.filter(is_staff=True).exclude(pk=user.pk):
                other.delete()
        elif primary_admin:
            user = primary_admin
        else:
            user = User.objects.create_superuser(username, f'{username}@example.com', password)

        user.username = username
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()

        self.stdout.write(self.style.SUCCESS(f'[SUCCESS] Admin credentials set successfully! Username: "{username}", Password: "{password}"'))
