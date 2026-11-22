from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, About, Skill, Message, SiteSettings

class PortfolioAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='testadmin',
            email='admin@example.com',
            password='Password123!'
        )
        Profile.objects.create(full_name='MUTHU SELVAM.M')
        About.objects.create(heading='Test Heading')
        SiteSettings.objects.create(theme_mode='dark')
        Skill.objects.create(name='Python', category='Programming', display_order=1)

    def test_public_portfolio_endpoint(self):
        """GET /api/portfolio/ should return 200 and structured portfolio data without authentication."""
        res = self.client.get('/api/portfolio/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('profile', res.data)
        self.assertIn('skills', res.data)
        self.assertIn('settings', res.data)
        self.assertEqual(res.data['profile']['full_name'], 'MUTHU SELVAM.M')

    def test_contact_form_submission_with_sanitization(self):
        """POST /api/contact/ should strip XSS tags and save message."""
        payload = {
            'name': 'Visitor <script>alert("xss")</script>',
            'email': 'visitor@example.com',
            'subject': 'Inquiry',
            'message': 'Hello <b>Muthu</b>!'
        }
        res = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        msg = Message.objects.first()
        self.assertIsNotNone(msg)
        self.assertEqual(msg.name, 'Visitor')
        self.assertEqual(msg.message, 'Hello Muthu!')

    def test_auth_login_success(self):
        """POST /api/auth/login/ returns JWT tokens for superuser."""
        res = self.client.post('/api/auth/login/', {
            'username': 'testadmin',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_auth_login_invalid_password(self):
        """POST /api/auth/login/ fails for wrong password."""
        res = self.client.post('/api/auth/login/', {
            'username': 'testadmin',
            'password': 'WrongPassword'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_protected_routes_require_jwt(self):
        """Admin endpoints should reject unauthenticated requests."""
        res = self.client.get('/api/admin/profile/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

