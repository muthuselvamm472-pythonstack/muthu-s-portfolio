"""
Django REST Framework Serializers — Portfolio API
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, About, Skill, Experience, Certification,
    Project, Message, SocialLink, SiteSettings
)


class ProfileSerializer(serializers.ModelSerializer):
    profile_image_file = serializers.ImageField(write_only=True, required=False)
    resume_file_upload = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Profile
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Build full URL for profile image
        request = self.context.get('request')
        if instance.profile_image and request:
            data['profile_image'] = request.build_absolute_uri(instance.profile_image.url)
        if instance.resume_file and request:
            data['resume_file'] = request.build_absolute_uri(instance.resume_file.url)
        return data


class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.company_logo and request:
            data['company_logo'] = request.build_absolute_uri(instance.company_logo.url)
        return data


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.certificate_image and request:
            data['certificate_image'] = request.build_absolute_uri(instance.certificate_image.url)
        return data


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.project_image and request:
            data['project_image'] = request.build_absolute_uri(instance.project_image.url)
        return data


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['received_at', 'is_read', 'is_starred']


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = '__all__'


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'


# ── Public Portfolio Serializer ─────────────────────────────────────────────
class PublicPortfolioSerializer(serializers.Serializer):
    """
    Combines all portfolio data into a single response for the public frontend.
    This is what the React app fetches on load — no auth required.
    """
    profile = ProfileSerializer()
    about = AboutSerializer()
    skills = SkillSerializer(many=True)
    experiences = ExperienceSerializer(many=True)
    certifications = CertificationSerializer(many=True)
    projects = ProjectSerializer(many=True)
    social_links = SocialLinkSerializer(many=True)
    settings = SiteSettingsSerializer()


# ── Auth Serializers ────────────────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']
