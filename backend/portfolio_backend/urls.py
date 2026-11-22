"""
Django URL Configuration — Portfolio Backend
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Ensure media files (resumes, project images) are served in both dev and production
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
