"""
API URL Patterns — Portfolio Backend
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ── Public (no auth required) ──────────────────────────────────────────────
    path('portfolio/', views.public_portfolio, name='public_portfolio'),
    path('contact/', views.submit_message, name='submit_message'),

    # ── Auth ───────────────────────────────────────────────────────────────────
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('auth/change-credentials/', views.ChangeCredentialsView.as_view(), name='change_credentials'),

    # ── Admin — Dashboard Stats ────────────────────────────────────────────────
    path('admin/stats/', views.admin_stats, name='admin_stats'),

    # ── Admin — Profile & Hero ─────────────────────────────────────────────────
    path('admin/profile/', views.AdminProfileView.as_view(), name='admin_profile'),

    # ── Admin — About ──────────────────────────────────────────────────────────
    path('admin/about/', views.AdminAboutView.as_view(), name='admin_about'),

    # ── Admin — Skills ─────────────────────────────────────────────────────────
    path('admin/skills/', views.AdminSkillListView.as_view(), name='admin_skills'),
    path('admin/skills/<int:pk>/', views.AdminSkillDetailView.as_view(), name='admin_skill_detail'),

    # ── Admin — Experience ─────────────────────────────────────────────────────
    path('admin/experience/', views.AdminExperienceListView.as_view(), name='admin_experience'),
    path('admin/experience/<int:pk>/', views.AdminExperienceDetailView.as_view(), name='admin_experience_detail'),

    # ── Admin — Certifications ─────────────────────────────────────────────────
    path('admin/certifications/', views.AdminCertListView.as_view(), name='admin_certs'),
    path('admin/certifications/<int:pk>/', views.AdminCertDetailView.as_view(), name='admin_cert_detail'),

    # ── Admin — Projects ───────────────────────────────────────────────────────
    path('admin/projects/', views.AdminProjectListView.as_view(), name='admin_projects'),
    path('admin/projects/<int:pk>/', views.AdminProjectDetailView.as_view(), name='admin_project_detail'),

    # ── Admin — Messages ───────────────────────────────────────────────────────
    path('admin/messages/', views.AdminMessageListView.as_view(), name='admin_messages'),
    path('admin/messages/<int:pk>/', views.AdminMessageDetailView.as_view(), name='admin_message_detail'),

    # ── Admin — Social Links ───────────────────────────────────────────────────
    path('admin/social/', views.AdminSocialListView.as_view(), name='admin_social'),
    path('admin/social/<int:pk>/', views.AdminSocialDetailView.as_view(), name='admin_social_detail'),

    # ── Admin — Site Settings (Theme + Section Visibility) ────────────────────
    path('admin/settings/', views.AdminSettingsView.as_view(), name='admin_settings'),
]
