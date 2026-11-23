from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    Profile, About, Skill, Experience, Certification,
    Project, SocialLink, SiteSettings
)

class Command(BaseCommand):
    help = 'Seeds initial portfolio data and creates admin user if missing'

    def handle(self, *args, **options):
        # 1. Superuser / Admin User
        admin_user, created = User.objects.get_or_create(username='admin')
        if created:
            admin_user.set_password('admin123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.email = 'muthuselvamm472@gmail.com'
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created superuser "admin" with password "admin123"'))

        # Also create muthu user if desired
        muthu_user, m_created = User.objects.get_or_create(username='muthu')
        if m_created:
            muthu_user.set_password('muthu2026')
            muthu_user.is_staff = True
            muthu_user.is_superuser = True
            muthu_user.email = 'muthuselvamm472@gmail.com'
            muthu_user.save()
            self.stdout.write(self.style.SUCCESS('Created superuser "muthu" with password "muthu2026"'))

        # 2. Profile — use get_or_create to protect user admin edits from being overwritten on deploy
        Profile.objects.get_or_create(
            id=1,
            defaults={
                'full_name': 'MUTHU SELVAM.M',
                'professional_title': 'PYTHON FULL STACK DEVELOPER',
                'tagline': 'Motivated software development professional with a strong foundation in Python, SQL, HTML5, CSS3, React.js, and Manual Testing.',
                'hero_description': 'Motivated software development professional with a strong foundation in Python, SQL, HTML5, CSS3, and Manual Testing. Eager to contribute to the development and testing of efficient, responsive, and reliable applications while applying analytical thinking, problem-solving skills, attention to detail, and a commitment to continuous learning to support organizational success.',
                'profile_image_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'email': 'muthuselvamm472@gmail.com',
                'phone': '+91 8678922362',
                'location': 'Chennai, Tamil Nadu, India',
                'button1_text': 'View My Work',
                'button1_url': '#projects',
                'button2_text': 'Download Resume',
                'button2_url': '/Muthu_Selvam_Resume.pdf',
                'show_hero_buttons': True
            }
        )

        # 3. About — use get_or_create to protect user admin edits from being overwritten on deploy
        About.objects.get_or_create(
            id=1,
            defaults={
                'heading': 'Driven BCA graduate with a strong academic foundation in Python, SQL, and Web Technologies.',
                'short_description': 'Bachelor of Computer Application (CGPA: 7.8) from Agurchand Manmull Jain College, Mennambakkam, Chennai | HSC 12th (80%) from St. Sebastian Matriculation Higher Secondary School, Pallavaram.',
                'detailed_description': 'Motivated software development professional with a strong foundation in Python, SQL, HTML5, CSS3, and Manual Testing. Eager to contribute to the development and testing of efficient, responsive, and reliable applications while applying analytical thinking, problem-solving skills, attention to detail, and a commitment to continuous learning to support organizational success.',
                'current_focus': 'Python Full Stack Development (Qspiders), Django REST Framework, React.js, Manual Testing & SQL.',
                'core_technologies': 'PYTHON3 • SQL • HTML5 • CSS3 • REACT.JS • MANUAL TESTING • MICROSOFT OFFICE',
                'show_resume_button': True
            }
        )

        # 4. Skills
        initial_skills = [
            {'name': 'Python 3', 'category': 'Programming', 'icon': 'Code', 'display_order': 1},
            {'name': 'SQL', 'category': 'Programming', 'icon': 'Code', 'display_order': 2},
            {'name': 'HTML5', 'category': 'Frontend', 'icon': 'Layout', 'display_order': 1},
            {'name': 'CSS3', 'category': 'Frontend', 'icon': 'Layout', 'display_order': 2},
            {'name': 'React.js', 'category': 'Frontend', 'icon': 'Layout', 'display_order': 3},
            {'name': 'Manual Testing', 'category': 'Testing & QA', 'icon': 'CheckCircle', 'display_order': 1},
            {'name': 'Microsoft Office (Excel / Word)', 'category': 'Tools', 'icon': 'Wrench', 'display_order': 1},
            {'name': 'Git & GitHub', 'category': 'Tools', 'icon': 'Wrench', 'display_order': 2},
            {'name': 'Languages: English, Tamil', 'category': 'Languages & Soft Skills', 'icon': 'User', 'display_order': 1},
            {'name': 'Soft Skills: Collaboration, Time Management, Creative Thinking, Multitasking', 'category': 'Languages & Soft Skills', 'icon': 'User', 'display_order': 2},
        ]
        for item in initial_skills:
            Skill.objects.get_or_create(name=item['name'], defaults=item)

        # 5. Experience
        initial_exps = [
            {
                'role': 'UI/UX & Web Design Intern',
                'company': "ZohoTech's Training & Placement Services",
                'location': 'Chennai, India',
                'start_date': 'Jan 2024',
                'end_date': 'Feb 2024',
                'description': 'Collaborated closely with the design team to implement UI/UX designs and used technologies like HTML, CSS. Actively learned and followed UI development best practices, contributing to a clean, responsive, and user-friendly interface.',
                'technologies': ['HTML5', 'CSS3', 'UI/UX Design', 'Responsive Web Design'],
                'display_order': 1
            },
            {
                'role': 'Data Entry & Office Systems Intern',
                'company': 'Aassaan Educare Foundation',
                'location': 'Chennai, India',
                'start_date': 'March 2025',
                'end_date': 'April 2025',
                'description': 'Maintained and organized records in MS Excel, Word, and database systems. Entered and updated data with high accuracy and attention to detail.',
                'technologies': ['MS Excel', 'MS Word', 'Database Systems', 'Data Management'],
                'display_order': 2
            }
        ]
        for exp in initial_exps:
            Experience.objects.get_or_create(company=exp['company'], role=exp['role'], defaults=exp)

        # 6. Certifications
        initial_certs = [
            {'name': 'Qspiders - Python Full Stack (Ongoing)', 'organization': 'Qspiders Training Institute', 'issue_date': 'Ongoing', 'credential_url': 'https://www.qspiders.com', 'display_order': 1},
            {'name': 'Data Analytics', 'organization': 'HP LIFE', 'issue_date': '2025', 'credential_url': 'https://www.life-global.org', 'display_order': 2},
            {'name': 'Basics of Python', 'organization': 'Infosys Springboard', 'issue_date': '2025', 'credential_url': 'https://infyspringboard.onwingspan.com', 'display_order': 3},
            {'name': 'TCS iON Career Edge - Young Professional', 'organization': 'TCS iON', 'issue_date': '2025', 'credential_url': 'https://learning.tcsionhub.in', 'display_order': 4},
            {'name': 'Python for Data Science', 'organization': 'NPTEL', 'issue_date': '2025', 'credential_url': 'https://nptel.ac.in', 'display_order': 5},
            {'name': "Web Design Certificate", 'organization': "Zoho Tech's Training & Placement Services", 'issue_date': '2024', 'credential_url': '#', 'display_order': 6},
            {'name': 'Data Entry Certificate', 'organization': 'Aassaan Educare Foundation', 'issue_date': '2025', 'credential_url': '#', 'display_order': 7},
            {'name': 'Web Development Certificate', 'organization': 'WHYTAB GLOBAL SERVICES', 'issue_date': '2025', 'credential_url': '#', 'display_order': 8},
        ]
        for cert in initial_certs:
            Certification.objects.get_or_create(name=cert['name'], organization=cert['organization'], defaults=cert)

        # 7. Projects
        initial_projects = [
            {
                'title': 'Python Full Stack Web Application',
                'short_description': 'Scalable web application built with Python, SQL database storage, and React frontend interface.',
                'detailed_description': 'Features user authentication, responsive dashboard layout, clean data querying, and RESTful API endpoints.',
                'project_image_url': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
                'technologies': ['Python', 'SQL', 'React.js', 'HTML5', 'CSS3'],
                'github_url': 'https://github.com/muthuselvamm472-pythonstack',
                'live_demo_url': '#',
                'is_featured': True,
                'display_order': 1
            },
            {
                'title': 'Personal Developer Portfolio',
                'short_description': 'Modern, high-performance portfolio featuring theme toggling, clean layout dividers, and resume downloads.',
                'detailed_description': 'Built with React.js, custom CSS design system, responsive grids, and clean component architecture.',
                'project_image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                'technologies': ['React.js', 'JavaScript', 'HTML5', 'CSS3'],
                'github_url': 'https://github.com/muthuselvamm472-pythonstack',
                'live_demo_url': '#',
                'is_featured': True,
                'display_order': 2
            }
        ]
        for proj in initial_projects:
            Project.objects.get_or_create(title=proj['title'], defaults=proj)

        # 8. Social Links
        initial_socials = [
            {'platform': 'GitHub', 'url': 'https://github.com/muthuselvamm472-pythonstack', 'icon': 'Github', 'display_order': 1},
            {'platform': 'LinkedIn', 'url': 'https://www.linkedin.com/in/muthuselvamm472', 'icon': 'Linkedin', 'display_order': 2},
            {'platform': 'Email', 'url': 'mailto:muthuselvamm472@gmail.com', 'icon': 'Mail', 'display_order': 3},
        ]
        for s in initial_socials:
            SocialLink.objects.get_or_create(platform=s['platform'], defaults=s)

        # 9. Site Settings
        SiteSettings.objects.get_or_create(
            id=1,
            defaults={
                'theme_mode': 'light',
                'primary_color': '#f59e0b',
                'accent_color': '#fbbf24',
                'background_color': '#ffffff',
                'text_color': '#0f172a',
                'card_color': '#ffffff',
                'border_radius': '18px',
                'show_hero': True,
                'show_about': True,
                'show_skills': True,
                'show_experience': True,
                'show_certifications': True,
                'show_projects': True,
                'show_contact': True,
                'show_footer': True,
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded initial portfolio database records!'))
