"""
Portfolio Backend — Django Models
All portfolio data stored in Oracle SQL tables.
"""
from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """Portfolio owner's personal information and hero section content."""
    objects = models.Manager()
    full_name = models.CharField(max_length=100, default='MUTHU SELVAM.M')
    professional_title = models.CharField(max_length=200, default='PYTHON FULL STACK DEVELOPER')
    tagline = models.CharField(max_length=500, blank=True, default='')
    hero_description = models.TextField(blank=True, default='')
    profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    profile_image_url = models.TextField(blank=True, default='')
    email = models.EmailField(default='muthuselvamm472@gmail.com')
    phone = models.CharField(max_length=20, blank=True, default='+91 8678922362')
    location = models.CharField(max_length=200, blank=True, default='Chennai, Tamil Nadu, India')
    resume_file = models.FileField(upload_to='resume/', blank=True, null=True)
    resume_url = models.TextField(blank=True, default='/Muthu_Selvam_Resume.pdf')
    # Hero headline & typography animation controls
    hero_line1 = models.CharField(max_length=200, blank=True, default="I'm Muthu Selvam,")
    hero_line2 = models.CharField(max_length=200, blank=True, default="A Python Full Stack")
    hero_line3 = models.CharField(max_length=200, blank=True, default="developer")
    status_badge_text = models.CharField(max_length=200, blank=True, default="Available for Full Stack Opportunities")
    show_status_badge = models.BooleanField(default=True)
    typewriter_roles = models.JSONField(default=list, blank=True)
    # Hero buttons
    button1_text = models.CharField(max_length=50, default='View My Work')
    button1_url = models.CharField(max_length=200, default='#projects')
    button1_visible = models.BooleanField(default=True)
    button2_text = models.CharField(max_length=50, default='View Resume')
    button2_url = models.TextField(blank=True, default='/Muthu_Selvam_Resume.pdf')
    button2_visible = models.BooleanField(default=True)
    show_hero_buttons = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'PORTFOLIO_PROFILE'

    def __str__(self):
        return str(self.full_name)


class About(models.Model):
    """About section content."""
    objects = models.Manager()
    heading = models.TextField(default='Driven BCA graduate with a strong academic foundation.')
    short_description = models.TextField(blank=True, default='')
    detailed_description = models.TextField(blank=True, default='')
    current_focus = models.TextField(blank=True, default='')
    core_technologies = models.CharField(max_length=500, blank=True, default='')
    show_resume_button = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'PORTFOLIO_ABOUT'

    def __str__(self):
        return 'About Section'


class Skill(models.Model):
    """Individual skills displayed in the Skills section."""
    objects = models.Manager()
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, default='Other')
    icon = models.CharField(max_length=50, blank=True, default='Code')
    display_order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'PORTFOLIO_SKILL'
        ordering = ['display_order', 'name']

    def __str__(self):
        return f'{self.name} ({self.category})'


class Experience(models.Model):
    """Work/internship experience entries."""
    objects = models.Manager()
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, default='')
    start_date = models.CharField(max_length=50, blank=True, default='')
    end_date = models.CharField(max_length=50, blank=True, default='Present')
    description = models.TextField(blank=True, default='')
    technologies = models.JSONField(default=list, blank=True)
    company_logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'PORTFOLIO_EXPERIENCE'
        ordering = ['display_order', '-start_date']

    def __str__(self):
        return f'{self.role} at {self.company}'


class Certification(models.Model):
    """Certifications and achievements."""
    objects = models.Manager()
    name = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    issue_date = models.CharField(max_length=50, blank=True, default='')
    credential_url = models.URLField(blank=True, default='')
    certificate_image = models.ImageField(upload_to='certificates/', blank=True, null=True)
    certificate_image_data = models.TextField(blank=True, default='')  # base64 for uploaded files
    display_order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'PORTFOLIO_CERTIFICATION'
        ordering = ['display_order', 'name']

    def __str__(self):
        return f'{self.name} - {self.organization}'


class Project(models.Model):
    """Portfolio projects."""
    objects = models.Manager()
    title = models.CharField(max_length=200)
    short_description = models.TextField(blank=True, default='')
    detailed_description = models.TextField(blank=True, default='')
    project_image = models.ImageField(upload_to='projects/', blank=True, null=True)
    project_image_url = models.TextField(blank=True, default='')
    technologies = models.JSONField(default=list, blank=True)
    github_url = models.URLField(blank=True, default='')
    live_demo_url = models.URLField(blank=True, default='')
    start_date = models.CharField(max_length=50, blank=True, default='')
    end_date = models.CharField(max_length=50, blank=True, default='')
    is_featured = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'PORTFOLIO_PROJECT'
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return str(self.title)


class Message(models.Model):
    """Contact form messages from visitors."""
    objects = models.Manager()
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True, default='')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'PORTFOLIO_MESSAGE'
        ordering = ['-received_at']

    def __str__(self):
        return f'From {self.name}: {self.subject}'


class SocialLink(models.Model):
    """Social media and professional profile links."""
    objects = models.Manager()
    platform = models.CharField(max_length=100, default='Other')
    url = models.CharField(max_length=500)
    icon = models.CharField(max_length=50, blank=True, default='')
    display_order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'PORTFOLIO_SOCIAL_LINK'
        ordering = ['display_order', 'platform']

    def __str__(self):
        return f'{self.platform}: {self.url}'


class SiteSettings(models.Model):
    """Site-wide settings: theme, section visibility."""
    objects = models.Manager()
    # Theme
    theme_mode = models.CharField(max_length=10, default='light', choices=[('light', 'Light'), ('dark', 'Dark')])
    primary_color = models.CharField(max_length=20, default='#f59e0b')
    accent_color = models.CharField(max_length=20, default='#fbbf24')
    background_color = models.CharField(max_length=20, default='#ffffff')
    text_color = models.CharField(max_length=20, default='#0f172a')
    card_color = models.CharField(max_length=20, default='#ffffff')
    border_radius = models.CharField(max_length=10, default='18px')
    # Section visibility
    show_hero = models.BooleanField(default=True)
    show_about = models.BooleanField(default=True)
    show_skills = models.BooleanField(default=True)
    show_experience = models.BooleanField(default=True)
    show_certifications = models.BooleanField(default=True)
    show_projects = models.BooleanField(default=True)
    show_contact = models.BooleanField(default=True)
    show_footer = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'PORTFOLIO_SETTINGS'

    def __str__(self):
        return 'Site Settings'
