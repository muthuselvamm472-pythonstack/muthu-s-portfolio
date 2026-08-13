"""
Django admin registration for portfolio models
"""
from django.contrib import admin
from .models import (
    Profile, About, Skill, Experience, Certification,
    Project, Message, SocialLink, SiteSettings
)

admin.site.register(Profile)
admin.site.register(About)
admin.site.register(Skill)
admin.site.register(Experience)
admin.site.register(Certification)
admin.site.register(Project)
admin.site.register(Message)
admin.site.register(SocialLink)
admin.site.register(SiteSettings)
