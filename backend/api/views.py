"""
Portfolio API Views — Django REST Framework
Protected endpoints require JWT Bearer token.
Public endpoints return portfolio data without auth.
"""
import os
import re
import base64
from django.conf import settings
from django.http import HttpResponse, FileResponse, HttpResponseNotFound
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db.models import Q
from django.utils.html import strip_tags
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import (
    Profile, About, Skill, Experience, Certification,
    Project, Message, SocialLink, SiteSettings
)
from .serializers import (
    ProfileSerializer, AboutSerializer, SkillSerializer,
    ExperienceSerializer, CertificationSerializer, ProjectSerializer,
    MessageSerializer, SocialLinkSerializer, SiteSettingsSerializer,
    LoginSerializer, UserSerializer
)


# ─── Helper: get or create singleton records ──────────────────────────────────
def get_profile():
    return Profile.objects.first() or Profile.objects.create()

def get_about():
    return About.objects.first() or About.objects.create()

def get_settings():
    return SiteSettings.objects.first() or SiteSettings.objects.create()


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH VIEWS
# ═══════════════════════════════════════════════════════════════════════════════

class LoginView(APIView):
    """POST /api/auth/login/ — Authenticate and return JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        data = getattr(serializer, 'validated_data', None)
        username = data.get('username') if isinstance(data, dict) else None
        password = data.get('password') if isinstance(data, dict) else None
        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_staff and not user.is_superuser:
            return Response(
                {'error': 'Access denied. Admin privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


class LogoutView(APIView):
    """POST /api/auth/logout/ — Blacklist refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """GET /api/auth/me/ — Get current authenticated user info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangeCredentialsView(APIView):
    """POST /api/auth/change-credentials/ — Update admin username and/or password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password', '')
        new_username = request.data.get('new_username', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not current_password:
            return Response({'error': 'Current password is required to authorize changes.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
                return Response({'error': f'Username "{new_username}" is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        if new_password:
            if len(new_password) < 4:
                return Response({'error': 'New password must be at least 4 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()

        # Generate fresh JWT tokens for seamless auth state
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Admin credentials updated successfully!',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC PORTFOLIO VIEW
# ═══════════════════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio(request):
    """
    GET /api/portfolio/
    Returns all public portfolio data. NO auth required.
    The React frontend calls this on load.
    """
    try:
        profile = get_profile()
        about = get_about()
        site_settings = get_settings()

        ctx = {'request': request}

        data = {
            'profile': ProfileSerializer(profile, context=ctx).data,
            'about': AboutSerializer(about, context=ctx).data,
            'skills': SkillSerializer(
                Skill.objects.all().order_by('display_order', 'id'),
                many=True, context=ctx
            ).data,
            'experiences': ExperienceSerializer(
                Experience.objects.all().order_by('display_order', 'id'),
                many=True, context=ctx
            ).data,
            'certifications': CertificationSerializer(
                Certification.objects.all().order_by('display_order', 'id'),
                many=True, context=ctx
            ).data,
            'projects': ProjectSerializer(
                Project.objects.all().order_by('display_order', '-created_at'),
                many=True, context=ctx
            ).data,
            'social_links': SocialLinkSerializer(
                SocialLink.objects.all().order_by('display_order', 'id'),
                many=True, context=ctx
            ).data,
            'settings': SiteSettingsSerializer(site_settings, context=ctx).data,
        }
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_resume(request):
    """
    GET /api/resume/
    Public stream of the current active resume.
    1. Returns decoded PDF from database base64 (always persistent on Render).
    2. Fallback to resume_file on disk.
    3. Fallback to bundled PDF file in frontend/public.
    """
    profile = get_profile()
    filename = getattr(profile, 'resume_filename', '') or 'Muthu_Selvam_Resume.pdf'

    # 1. From database base64 (most resilient, works on Render even after restart)
    if profile.resume_data:
        try:
            pdf_bytes = base64.b64decode(profile.resume_data)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
        except Exception as e:
            print('Error streaming resume from DB:', e)

    # 2. From file storage
    if profile.resume_file:
        try:
            if profile.resume_file.storage.exists(profile.resume_file.name):
                response = FileResponse(profile.resume_file.open('rb'), content_type='application/pdf')
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                return response
        except Exception as e:
            print('Error streaming resume file:', e)

    # 3. Fallback to bundled resume file in frontend/public or backend static
    fallback_paths = [
        settings.BASE_DIR / 'media' / 'resume' / 'Muthu_Selvam_Resume.pdf',
        settings.BASE_DIR.parent / 'frontend' / 'public' / 'Muthu_Selvam_Resume.pdf',
        settings.BASE_DIR.parent / 'frontend' / 'public' / 'Muthu Selvam(RESUME).pdf',
    ]
    for p in fallback_paths:
        if p.exists():
            response = FileResponse(open(p, 'rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response

    return HttpResponseNotFound("Resume not found.")


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def submit_message(request):
    """POST /api/contact/ — Submit a contact form message with XSS sanitization and rate limiting."""
    data = dict(request.data) if hasattr(request.data, 'items') else {}
    cleaned = {}
    for k, v in data.items():
        if isinstance(v, list) and len(v) == 1:
            v = v[0]
        if isinstance(v, str):
            # Strip entire script tags and their content
            clean_str = re.sub(r'<script.*?>.*?</script>', '', v, flags=re.IGNORECASE | re.DOTALL)
            clean_str = strip_tags(clean_str).strip()
            cleaned[k] = clean_str
        else:
            cleaned[k] = v

    serializer = MessageSerializer(data=cleaned)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Message sent successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — PROFILE & HERO
# ═══════════════════════════════════════════════════════════════════════════════

class AdminProfileView(APIView):
    """GET/PUT /api/admin/profile/ — Manage profile & hero content."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_profile()
        return Response(ProfileSerializer(profile, context={'request': request}).data)

    def put(self, request):
        profile = get_profile()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Check if resume_url is a base64 encoded PDF document
        raw_resume = data.get('resume_url', '')
        resume_filename = data.get('resume_filename', '') or 'Muthu_Selvam_Resume.pdf'

        if isinstance(raw_resume, str) and raw_resume.startswith('data:'):
            try:
                header, base64_str = raw_resume.split(';base64,', 1)
                decoded_file = base64.b64decode(base64_str)
                file_name = 'Muthu_Selvam_Resume.pdf'
                rel_path = f'resume/{file_name}'
                if default_storage.exists(rel_path):
                    default_storage.delete(rel_path)
                if profile.resume_file and profile.resume_file.name != rel_path:
                    try:
                        profile.resume_file.delete(save=False)
                    except Exception:
                        pass
                
                profile.resume_data = base64_str
                profile.resume_filename = resume_filename
                profile.resume_file.save(file_name, ContentFile(decoded_file), save=True)
                profile.resume_url = '/api/resume/'
                profile.button2_url = '/api/resume/'
                profile.save()

                data['resume_url'] = '/api/resume/'
                data['button2_url'] = '/api/resume/'

                # Also copy to frontend/public for fallback offline access
                try:
                    frontend_public = settings.BASE_DIR.parent / 'frontend' / 'public'
                    if frontend_public.exists():
                        with open(frontend_public / 'Muthu_Selvam_Resume.pdf', 'wb') as f:
                            f.write(decoded_file)
                        with open(frontend_public / 'Muthu Selvam(RESUME).pdf', 'wb') as f:
                            f.write(decoded_file)
                except Exception as ex:
                    print('Note: Could not copy to frontend/public:', ex)
            except Exception as e:
                print('Error decoding resume base64:', e)
        elif raw_resume == '':
            profile.resume_file = None
            profile.resume_data = ''
            profile.resume_url = ''
            profile.button2_url = ''
            profile.save()
            data['resume_url'] = ''
            data['button2_url'] = ''
        elif isinstance(raw_resume, str) and (raw_resume.startswith('http://') or raw_resume.startswith('https://')):
            profile.resume_url = raw_resume
            profile.button2_url = raw_resume
            profile.save()

        # Check if profile_image is cleared
        if data.get('profile_image') == '':
            profile.profile_image = None
            data['profile_image_url'] = ''

        serializer = ProfileSerializer(profile, data=data, partial=True,
                                       context={'request': request})
        if serializer.is_valid():
            # Handle profile image upload
            if 'profile_image_file' in request.FILES:
                profile.profile_image = request.FILES['profile_image_file']
            # Handle resume file upload
            if 'resume_file_upload' in request.FILES:
                f = request.FILES['resume_file_upload']
                file_bytes = f.read()
                profile.resume_data = base64.b64encode(file_bytes).decode('utf-8')
                profile.resume_filename = f.name
                profile.resume_file.save(f.name, ContentFile(file_bytes), save=True)
                profile.resume_url = '/api/resume/'
                profile.button2_url = '/api/resume/'
                profile.save()
            serializer.save()
            return Response(ProfileSerializer(profile, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — ABOUT
# ═══════════════════════════════════════════════════════════════════════════════

class AdminAboutView(APIView):
    """GET/PUT /api/admin/about/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AboutSerializer(get_about()).data)

    def put(self, request):
        about = get_about()
        serializer = AboutSerializer(about, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — SKILLS
# ═══════════════════════════════════════════════════════════════════════════════

class AdminSkillListView(APIView):
    """GET /api/admin/skills/ — List all | POST — Add skill"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.all().order_by('display_order', 'name')
        return Response(SkillSerializer(skills, many=True).data)

    def post(self, request):
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSkillDetailView(APIView):
    """GET/PUT/DELETE /api/admin/skills/{id}/"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Skill.objects.get(pk=pk)
        except Skill.DoesNotExist:
            return None

    def get(self, request, pk):
        skill = self.get_object(pk)
        if not skill:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SkillSerializer(skill).data)

    def put(self, request, pk):
        skill = self.get_object(pk)
        if not skill:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SkillSerializer(skill, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        skill = self.get_object(pk)
        if not skill:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        skill.delete()
        return Response({'message': 'Skill deleted'}, status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — EXPERIENCE
# ═══════════════════════════════════════════════════════════════════════════════

class AdminExperienceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exps = Experience.objects.all().order_by('display_order')
        return Response(ExperienceSerializer(exps, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = ExperienceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            exp = serializer.save()
            if 'company_logo' in request.FILES:
                exp.company_logo = request.FILES['company_logo']
                exp.save()
            return Response(ExperienceSerializer(exp, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminExperienceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            return None

    def put(self, request, pk):
        exp = self.get_object(pk)
        if not exp:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExperienceSerializer(exp, data=request.data, partial=True,
                                          context={'request': request})
        if serializer.is_valid():
            exp = serializer.save()
            if 'company_logo' in request.FILES:
                exp.company_logo = request.FILES['company_logo']
                exp.save()
            return Response(ExperienceSerializer(exp, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        exp = self.get_object(pk)
        if not exp:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        exp.delete()
        return Response({'message': 'Experience deleted'}, status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — CERTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class AdminCertListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        certs = Certification.objects.all().order_by('display_order')
        return Response(CertificationSerializer(certs, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = CertificationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            cert = serializer.save()
            if 'certificate_image' in request.FILES:
                cert.certificate_image = request.FILES['certificate_image']
                cert.save()
            return Response(CertificationSerializer(cert, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCertDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Certification.objects.get(pk=pk)
        except Certification.DoesNotExist:
            return None

    def put(self, request, pk):
        cert = self.get_object(pk)
        if not cert:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # If certificate image was removed/cleared
        if request.data.get('certificate_image_data') == '' or request.data.get('certificate_image') == '':
            cert.certificate_image = None
            cert.certificate_image_data = ''
            cert.save()

        serializer = CertificationSerializer(cert, data=request.data, partial=True,
                                              context={'request': request})
        if serializer.is_valid():
            cert = serializer.save()
            if 'certificate_image' in request.FILES:
                cert.certificate_image = request.FILES['certificate_image']
                cert.save()
            return Response(CertificationSerializer(cert, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        cert = self.get_object(pk)
        if not cert:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        cert.delete()
        return Response({'message': 'Certification deleted'}, status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — PROJECTS
# ═══════════════════════════════════════════════════════════════════════════════

class AdminProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all().order_by('display_order', '-created_at')
        return Response(ProjectSerializer(projects, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            proj = serializer.save()
            if 'project_image' in request.FILES:
                proj.project_image = request.FILES['project_image']
                proj.save()
            return Response(ProjectSerializer(proj, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None

    def put(self, request, pk):
        proj = self.get_object(pk)
        if not proj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # If project image was removed/cleared
        if request.data.get('project_image_url') == '' or request.data.get('project_image') == '':
            proj.project_image = None
            proj.project_image_url = ''
            proj.save()

        serializer = ProjectSerializer(proj, data=request.data, partial=True,
                                        context={'request': request})
        if serializer.is_valid():
            proj = serializer.save()
            if 'project_image' in request.FILES:
                proj.project_image = request.FILES['project_image']
                proj.save()
            return Response(ProjectSerializer(proj, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        proj = self.get_object(pk)
        if not proj:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        proj.delete()
        return Response({'message': 'Project deleted'}, status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — MESSAGES
# ═══════════════════════════════════════════════════════════════════════════════

class AdminMessageListView(APIView):
    """GET /api/admin/messages/ — View all contact messages. Admin only."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filter_type = request.query_params.get('filter', 'all')
        messages = Message.objects.all()
        if filter_type == 'unread':
            messages = messages.filter(is_read=False)
        elif filter_type == 'starred':
            messages = messages.filter(is_starred=True)
        return Response(MessageSerializer(messages, many=True).data)


class AdminMessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            return None

    def get(self, request, pk):
        msg = self.get_object(pk)
        if not msg:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        # Mark as read when viewed
        if not msg.is_read:
            msg.is_read = True
            msg.save()
        return Response(MessageSerializer(msg).data)

    def patch(self, request, pk):
        """PATCH — toggle read/starred status"""
        msg = self.get_object(pk)
        if not msg:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if 'is_read' in request.data:
            msg.is_read = request.data['is_read']
        if 'is_starred' in request.data:
            msg.is_starred = request.data['is_starred']
        msg.save()
        return Response(MessageSerializer(msg).data)

    def delete(self, request, pk):
        msg = self.get_object(pk)
        if not msg:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        msg.delete()
        return Response({'message': 'Message deleted'}, status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — SOCIAL LINKS
# ═══════════════════════════════════════════════════════════════════════════════

class AdminSocialListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        links = SocialLink.objects.all().order_by('display_order')
        return Response(SocialLinkSerializer(links, many=True).data)

    def post(self, request):
        serializer = SocialLinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSocialDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return SocialLink.objects.get(pk=pk)
        except SocialLink.DoesNotExist:
            return None

    def put(self, request, pk):
        link = self.get_object(pk)
        if not link:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SocialLinkSerializer(link, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        link = self.get_object(pk)
        if not link:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        link.delete()
        return Response({'message': 'Link deleted'}, status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — SITE SETTINGS (Theme + Section Visibility)
# ═══════════════════════════════════════════════════════════════════════════════

class AdminSettingsView(APIView):
    """GET/PUT /api/admin/settings/ — Theme & section visibility."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(SiteSettingsSerializer(get_settings()).data)

    def put(self, request):
        settings = get_settings()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — STATS (Dashboard overview)
# ═══════════════════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """GET /api/admin/stats/ — Dashboard summary counts."""
    return Response({
        'projects': Project.objects.count(),
        'skills': Skill.objects.count(),
        'experiences': Experience.objects.count(),
        'certifications': Certification.objects.count(),
        'total_messages': Message.objects.count(),
        'unread_messages': Message.objects.filter(is_read=False).count(),
        'starred_messages': Message.objects.filter(is_starred=True).count(),
    })
