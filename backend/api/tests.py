from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import base64
from .models import Profile, About, Skill, Message, SiteSettings, Project, SocialLink


class PortfolioAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='testadmin',
            email='admin@example.com',
            password='Password123!'
        )
        self.sample_pdf_b64 = base64.b64encode(b'%PDF-1.4\n%test\n').decode('utf-8')
        Profile.objects.create(
            full_name='MUTHU SELVAM.M',
            resume_data=self.sample_pdf_b64,
            resume_url='/api/resume/',
            resume_filename='Custom_Resume.pdf'
        )
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

    def test_partial_hero_update_preserves_uploaded_resume(self):
        """Partial PUT on /api/admin/profile/ (e.g. from HeroTab) must NOT clear resume_data."""
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.put('/api/admin/profile/', {
            'hero_line3': 'DEVELOPER',
            'tagline': 'Updated tagline'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        profile = Profile.objects.first()
        self.assertEqual(profile.hero_line3, 'DEVELOPER')
        self.assertEqual(profile.resume_url, '/api/resume/')
        self.assertEqual(profile.resume_data, self.sample_pdf_b64)

    def test_project_and_social_link_crud_with_placeholder_url(self):
        """Creating a project with '#' URL and adding Instagram social link should both succeed."""
        self.client.force_authenticate(user=self.admin_user)
        proj_res = self.client.post('/api/admin/projects/', {
            'title': 'New Portfolio App',
            'short_description': 'Built with React & Django',
            'github_url': 'https://github.com/muthuselvamm472-pythonstack',
            'live_demo_url': '#',
            'technologies': ['React', 'Django'],
            'is_featured': True,
            'display_order': 1
        }, format='json')
        self.assertEqual(proj_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)

        soc_res = self.client.post('/api/admin/social/', {
            'platform': 'Instagram',
            'url': 'https://www.instagram.com/_.selva_edr._/',
            'icon': 'Instagram',
            'display_order': 4
        }, format='json')
        self.assertEqual(soc_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SocialLink.objects.filter(platform='Instagram').count(), 1)

