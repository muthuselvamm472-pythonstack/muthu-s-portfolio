# ⚡ Muthu Selvam M — Full-Stack Developer Portfolio & CMS

<div align="center">

[![Live Portfolio](https://img.shields.io/badge/Live%20Demo-muthu--s--portfolio.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://muthu-s-portfolio.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/muthuselvamm472-pythonstack/muthu-s-portfolio)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.17-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-SimpleJWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20Oracle%20SQL-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/database/)

**An enterprise-grade, high-performance developer portfolio and full Content Management System (CMS) built with React 18, Vite, Django REST Framework, and an Apple-inspired Liquid Glass design language.**

[🌐 Live Portfolio](https://muthu-s-portfolio.vercel.app/) • [⚡ Admin Control Center](https://muthu-s-portfolio.vercel.app/#/admin) • [📁 GitHub Repository](https://github.com/muthuselvamm472-pythonstack/muthu-s-portfolio) • [🐛 Report Bug](https://github.com/muthuselvamm472-pythonstack/muthu-s-portfolio/issues)

</div>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Design System & UI Architecture](#-design-system--ui-architecture)
- [Key Features](#-key-features)
  - [1. Public Portfolio Showcase](#1-public-portfolio-showcase)
  - [2. Apple Liquid Glass Interface & Buttons](#2-apple-liquid-glass-interface--buttons)
  - [3. Interactive 3D Tech Carousel](#3-interactive-3d-tech-carousel)
  - [4. Dynamic Typography & Typewriter Engine](#4-dynamic-typography--typewriter-engine)
  - [5. Admin CMS & Control Center](#5-admin-cms--control-center)
  - [6. Dynamic Resume Management](#6-dynamic-resume-management)
  - [7. Intelligent Data & State Management](#7-intelligent-data--state-management)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Directory Structure](#-directory-structure)
- [Database Schema & Design](#-database-schema--design)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Running Both Servers Concurrently](#running-both-servers-concurrently)
- [Environment Configuration](#-environment-configuration)
- [Admin Credentials & Security](#-admin-credentials--security)
- [Deployment Guide](#-deployment-guide)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
  - [Backend Deployment (Render)](#backend-deployment-render)
- [Author & Contact](#-author--contact)

---

## 🌟 Overview

This project is a **production-ready, full-stack personal portfolio and live CMS** designed and developed by **Muthu Selvam M** (Python Full Stack Developer).

Unlike traditional static developer templates that require code edits and redeployments to update content, this platform combines a **modern client SPA (React 18 + Vite)** with a **decoupled Django REST API** and an **integrated Content Management System (CMS)**. 

Every single element on the website—from the headline typography and typewriter keywords, to projects, certifications, experiences, skill matrices, social links, and uploaded resumes—can be dynamically edited in real-time from the Admin Control Center without touching the codebase.

---

## 🎨 Design System & UI Architecture

The platform features an editorial **Quiet Luxury** color palette combined with **Apple Liquid Glass (Frosted Glassmorphism)**:

| Color Token | Hex Code | Role | Description |
| :--- | :--- | :--- | :--- |
| `--primary-color` | `#936142` | Primary Accent / Terracotta Chestnut | Used for active links, primary CTA buttons, badges, and brand highlights |
| `--secondary-color` | `#AC8A69` | Secondary Accent / Caramel Ochre | Used for borders, subtle icons, and secondary card rims |
| `--accent-color` | `#C58970` | Warm Ochre / Muted Clay | Used for interactive states, hover transitions, and glow highlights |
| `--bg-color` (Light) | `#CCBBA9` / `#EDE3D8` | Background / Warm Linen Sand | Soft, non-glare, architectural background for reading comfort |
| `--text-primary` | `#414942` | Slate Pine Charcoal | High-contrast editorial typography for maximum legibility (4.5+:1 ratio) |

### Apple Liquid Glass Details:
- **Optical Depth**: Utilizes high-saturation backdrop blurs (`backdrop-filter: blur(24px) saturate(180%)`) allowing grid lines and ambient page gradients to softly diffuse through.
- **Specular Top Rims**: Subtle glass reflections created with inset box shadows (`box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.85)`).
- **Architectural Drop Shadows**: Custom non-blurry drop shadows replacing shiny gradients for an elegant, minimal, and high-end feel.
- **Dark Mode Ergonomics**: Seamlessly converts to a deep slate glass (`#232724` / `#2b302c`) with bright linen text (`#EDE3D8`) ensuring complete readability without eye fatigue.

---

## ✨ Key Features

### 1. Public Portfolio Showcase
- **Architectural Fixed Navbar**:
  - Features dedicated **Home** button navigation with smooth scroll-to-top behavior.
  - Section links (`About`, `Skills`, `Experience`, `Certifications`, `Work`, `Contact`).
  - Active section indicator with pill highlights and no-overlap button gaps.
  - Floating Liquid Glass **Resume** action button and one-click **Dark/Light Mode** toggle.
- **Hero & Headline Engine**:
  - Configurable 3-line editorial hero greeting with warm terracotta radiance.
  - Interactive status pill (`Available for Full Stack Opportunities`) with real-time toggle.
  - Dynamic Typewriter component cycling through customizable role titles.
  - Dual CTA buttons: **"View My Work"** and **"View Resume"**.
  - Social pill list (*Email, GitHub, LinkedIn, Instagram*) with high-contrast icons.
- **About Section & Core Competencies**:
  - Academic background (*BCA, CGPA: 7.8, Agurchand Manmull Jain College*).
  - High-contrast **Core Technologies** pills (*Python3, SQL, HTML5, CSS3, React.js, Manual Testing, Microsoft Office*) visible in both light and dark modes.
- **Skills Matrix**:
  - Filterable categorized skills: *Programming, Frontend, Backend, Database, Tools, Soft Skills, QA*.
  - Custom display order, proficiency bars, and visibility toggles.
- **Experience Timeline**:
  - Chronological career & internship entries with company details, date tags, and contribution bullet points.
- **Interactive Certifications**:
  - Credential cards with issuer badges (*Qspiders, Infosys Springboard, TCS iON, HP LIFE, NPTEL*).
  - Integrated image modal and high-resolution lightbox for proof-of-completion verification.
- **Projects Showcase**:
  - Rich project cards with short/detailed descriptions, tech badges, live demo links, and GitHub repository links.
  - Special `⭐ Featured` project highlighting with responsive grid.
- **Direct Contact System**:
  - Client-side validated contact form (*Name, Email, Subject, Message*).
  - Instant dispatch to the Django REST backend and logged into the Admin Inbox.

---

### 2. Apple Liquid Glass Interface & Buttons
All interactive controls are designed with frosted translucent glass physics:
- **Primary Buttons (`.btn-primary`)**: Translucent terracotta gradient (`#936142` to `#835336`) with top specular highlight and smooth tactile lift.
- **Secondary Buttons (`.btn-secondary`)**: Translucent warm sand glass in light mode and translucent dark slate glass in dark mode, maintaining 100% text contrast.
- **Navbar (`.navbar`)**: Floats dynamically with scroll-direction detection (shrinks slightly on scroll down, elevates with smooth transitions on scroll up).

---

### 3. Interactive 3D Tech Carousel
- Custom CSS 3D perspective stage showcasing 7 core technologies (*Python, Django, JavaScript, React.js, SQL Database, HTML5, CSS3*).
- 3D circular rotation with depth-scaling, z-index calculation, and color-matched ambient drop shadows.
- Interactive physics: hover to pause rotation, click any node to bring it to center focus.
- 100% unified with the quiet luxury palette.

---

### 4. Dynamic Typography & Typewriter Engine
- Live headline rotator cycling through customizable role keywords (e.g., `DJANGO REST API SPECIALIST`, `REACT.JS & ORACLE SQL DEVELOPER`).
- Admin-controlled **Drag-and-Drop Chip Reordering** with character limits, live count badges, and uppercase normalization.
- High-contrast visual styling in both light and dark themes.

---

### 5. Admin CMS & Control Center
Accessible securely via `/#/admin`:
- **Dashboard Overview**:
  - Real-time KPI stat cards: *Total Projects, Skills, Experiences, Certifications, Unread Messages*.
  - Quick Action shortcuts to jump directly to any content editor.
- **Hero & Profile Manager**:
  - Real-time updates for greeting lines, professional titles, bio, and typewriter words.
- **Content CRUD Modules**:
  - **Skills Tab**: Add, edit, reorder, toggle visibility, and delete technical skills.
  - **Experience Tab**: Manage work experiences, training periods, and responsibilities.
  - **Certifications Tab**: Add credentials, upload certificate images (Base64 storage), and link verification URLs.
  - **Projects Tab**: Create/edit showcase projects with featured flags, repository URLs, and live links.
  - **Social Links Tab**: Manage social profiles (*GitHub, LinkedIn, Email, LeetCode, HackerRank, etc.*).
- **Messages Inbox**:
  - View visitor inquiries with timestamp, author email, subject, and message body.
  - Mark messages as read/unread or delete processed inquiries.
- **Theme & Section Settings**:
  - Toggle section visibility (*Hero, About, Skills, Experience, Certifications, Projects, Contact, Footer*) on/off with a single click.

---

### 6. Dynamic Resume Management
- Upload new resume files directly from the Admin CMS (stored securely in database / Base64 format).
- Intelligent fallback hierarchy:
  1. Custom uploaded resume from Admin panel.
  2. Local static PDF (`/Muthu_Selvam_Resume.pdf`).
- Works seamlessly on both local development and static cloud hosting (Vercel).

---

### 7. Intelligent Data & State Management
- **Persistent State Merging (`PortfolioContext`)**:
  - Database-first architecture where Django API data takes authoritative precedence.
  - Preserves offline/unsynced temporary additions seamlessly in browser `localStorage`.
  - Automated collision resolution and sequential order normalization.
- **Silent JWT Auto-Refresh**:
  - 72-hour access tokens with 30-day refresh cycle.
  - Automatic interception of `401 Unauthorized` responses to refresh credentials silently without logging the admin out.
- **Render Cold-Start Protection**:
  - Built-in 45-second timeout controller with user-friendly alerts for sleeping free-tier backends.

---

## 🛠 Architecture & Tech Stack

```mermaid
flowchart TD
    Client["React 18 SPA (Vite)"] -->|"REST API Requests"| Proxy["Vercel Rewrites / Vite Proxy"]
    Proxy -->|"JWT Bearer Auth"| Django["Django 5.2 + DRF Backend"]
    Django -->|"Django ORM"| DB[("SQLite / Oracle SQL Database")]
    Client -.->|"Offline Cache Fallback"| Storage[("Browser LocalStorage")]
```

### Frontend
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 18.2 | Component-based UI library |
| **Routing** | React Router DOM v7 | HashRouter (`/#/`, `/#/admin`) for static host compatibility |
| **Build Tool** | Vite 5.1 | High-speed ESM development server & production bundler |
| **Icons** | Lucide React | Modern, lightweight icon suite |
| **Styling** | Vanilla CSS (CSS3) | Custom responsive design system, variables, dark/light themes |

### Backend
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Django 5.2 | High-level Python web framework |
| **API Layer** | Django REST Framework | RESTful endpoints, serializers, and permissions |
| **Authentication** | DRF SimpleJWT | JWT token lifecycle with rotation and blacklisting |
| **Database** | SQLite / Oracle SQL | Dual-compatible ORM backend with customized tables |
| **Static & Media** | WhiteNoise / Pillow | Static asset serving and image processing |
| **WSGI Server** | Gunicorn | Production Python WSGI HTTP Server |

---

## 📂 Directory Structure

```text
muthu's portfolio/
├── start_servers.bat           # 1-Click script to start both dev servers
├── vercel.json                 # Vercel deployment & API rewrite configuration
├── README.md                   # Comprehensive project documentation
├── backend/
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python backend dependencies
│   ├── .env.example            # Environment variables template
│   ├── muthu_portfolio.db      # Local SQLite database
│   ├── portfolio_backend/      # Django core configuration
│   │   ├── settings.py         # Settings, JWT, CORS, Database config
│   │   ├── urls.py             # Root URL routing
│   │   └── wsgi.py             # WSGI application entry
│   └── api/                    # Portfolio API application
│       ├── models.py           # Database models (Profile, Projects, etc.)
│       ├── serializers.py      # DRF ModelSerializers
│       ├── views.py            # API views & JWT authentication
│       ├── urls.py             # API route endpoints
│       └── management/
│           └── commands/
│               ├── seed_data.py               # Initial data seeding
│               └── set_admin_credentials.py   # Admin account setup
└── frontend/
    ├── package.json            # Node.js dependencies & scripts
    ├── vite.config.js          # Vite config with backend proxy
    ├── public/                 # Static assets, PDFs, & logos
    │   ├── Muthu_Selvam_Resume.pdf
    │   └── logos/              # Tech stack icons
    └── src/
        ├── App.jsx             # Root React component & route gating
        ├── apiConfig.js        # Dynamic backend URL resolution
        ├── mockData.js         # Default fallback data structure
        ├── context/            # React Context Providers
        │   ├── AuthContext.jsx       # Admin JWT authentication
        │   ├── PortfolioContext.jsx  # Central portfolio state & API sync
        │   ├── ThemeContext.jsx      # Light/Dark mode state
        │   └── SectionContext.jsx    # Section visibility state
        ├── components/
        │   ├── common/         # Preloader, ScrollProgress, Buttons, Modals, Typewriter
        │   ├── public/         # Navbar, Hero, Tech3DCarousel, About, Skills, Projects, Contact
        │   └── dev/            # Admin Layout, CMS Tabs, and Control Panels
        └── styles/
            ├── global.css      # Base resets & typography
            ├── variables.css   # Color palette tokens & themes
            ├── public.css      # Portfolio layout & 3D carousel styles
            └── admin.css       # Admin dashboard & modal styles
```

---

## 🗄 Database Schema & Design

All entities utilize explicit database table mappings to support both **SQLite** and **Oracle SQL**:

| Model Name | Database Table | Purpose |
| :--- | :--- | :--- |
| `Profile` | `PORTFOLIO_PROFILE` | Full name, titles, bio, headline lines, status badge, typewriter roles, and resume URL. |
| `About` | `PORTFOLIO_ABOUT` | Academic highlights, detailed background, and core technologies. |
| `Skill` | `PORTFOLIO_SKILL` | Categorized technical competencies, display order, and visibility flags. |
| `Experience` | `PORTFOLIO_EXPERIENCE` | Work history, roles, companies, dates, descriptions, and technology tags. |
| `Certification` | `PORTFOLIO_CERTIFICATION` | Certifications, issuing bodies, dates, URLs, and Base64 certificate media. |
| `Project` | `PORTFOLIO_PROJECT` | Showcase projects, descriptions, GitHub repo, live URLs, and featured flags. |
| `Message` | `PORTFOLIO_MESSAGE` | Visitor contact form submissions, read status, and timestamps. |
| `SocialLink` | `PORTFOLIO_SOCIAL_LINK` | External profile URLs (*GitHub, LinkedIn, Twitter, LeetCode*). |
| `SiteSettings` | `PORTFOLIO_SETTINGS` | Default theme, brand colors, border radius, and section visibility toggles. |

---

## 🔌 API Endpoints Reference

### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/portfolio/` | Fetches the complete aggregated portfolio data (profile, about, skills, projects, etc.). |
| `POST` | `/api/contact/` | Submits a new contact inquiry from the public portfolio. |

### Authentication Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Authenticates administrator and returns JWT Access & Refresh tokens. |
| `POST` | `/api/auth/logout/` | Blacklists refresh token and clears session. |
| `POST` | `/api/auth/token/refresh/` | Exchanges valid Refresh token for a new Access token. |
| `GET` | `/api/auth/me/` | Retrieves authenticated admin user metadata. |
| `POST` | `/api/auth/change-credentials/` | Updates admin username and password. |

### Admin Endpoints (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats/` | Overview metrics (inquiries, skills, projects, certifications count). |
| `PUT` | `/api/admin/profile/` | Updates personal profile, hero lines, and resume links. |
| `PUT` | `/api/admin/about/` | Updates About section information. |
| `GET` / `POST` | `/api/admin/skills/` | Lists or creates skills. |
| `PUT` / `DELETE`| `/api/admin/skills/<id>/` | Modifies or deletes a skill entry. |
| `GET` / `POST` | `/api/admin/experience/` | Lists or creates work experiences. |
| `PUT` / `DELETE`| `/api/admin/experience/<id>/` | Modifies or deletes an experience entry. |
| `GET` / `POST` | `/api/admin/certifications/` | Lists or creates certifications. |
| `PUT` / `DELETE`| `/api/admin/certifications/<id>/` | Modifies or deletes a certification. |
| `GET` / `POST` | `/api/admin/projects/` | Lists or creates projects. |
| `PUT` / `DELETE`| `/api/admin/projects/<id>/` | Modifies or deletes a project. |
| `GET` | `/api/admin/messages/` | Lists all contact messages. |
| `PATCH` / `DELETE`| `/api/admin/messages/<id>/` | Toggles message read status or deletes message. |
| `GET` / `POST` | `/api/admin/social/` | Lists or creates social media links. |
| `PUT` / `DELETE`| `/api/admin/social/<id>/` | Modifies or deletes a social link. |
| `PUT` | `/api/admin/settings/` | Updates site theme, color tokens, and section visibility. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **Python**: Version 3.10 or higher
- **Git**

---

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/muthuselvamm472-pythonstack/muthu-s-portfolio.git
cd "muthu-s-portfolio"
```

#### 2. Backend Setup (Django REST Framework)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux

# Run database migrations
python manage.py migrate

# Seed initial portfolio data
python manage.py seed_data

# Create or verify admin user credentials
python manage.py set_admin_credentials

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

#### 3. Frontend Setup (React + Vite)
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

---

### Running Both Servers Concurrently
On Windows, you can double-click the included automation batch file:
```cmd
start_servers.bat
```
This automatically launches:
1. **Django REST API**: `http://127.0.0.1:8000/`
2. **Vite React Frontend**: `http://127.0.0.1:3000/`

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Django Settings
DJANGO_SECRET_KEY=your-custom-django-secret-key-change-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,testserver,*

# Database Choice: 'sqlite' (default, zero setup) | 'oracle'
DB_BACKEND=sqlite

# Oracle Database Credentials (only needed if DB_BACKEND=oracle)
ORACLE_USER=SYSTEM
ORACLE_PASSWORD=your_oracle_password
ORACLE_DSN=localhost:1521/ORCL

# JWT Token Lifetime Settings
JWT_ACCESS_TOKEN_LIFETIME_HOURS=72
JWT_REFRESH_TOKEN_LIFETIME_DAYS=30

# Default Admin User Setup
ADMIN_USERNAME=muthu
ADMIN_PASSWORD=Admin@2026

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://muthu-s-portfolio.vercel.app
```

---

## 🔐 Admin Credentials & Security

- **Default Admin Route**: `http://localhost:3000/#/admin`
- **Default Username**: `muthu` *(or configured in `.env`)*
- **Default Password**: `Admin@2026`

To change the admin password at any time via CLI:
```bash
python manage.py set_admin_credentials --username your_username --password your_new_password
```
Or log in to `/#/admin` and navigate to the top-right user menu to change credentials directly from the browser.

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)
The repository includes a root `vercel.json` with API rewrite routing.
1. Connect your repository to [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure Build Command: `npm run build` and Output Directory: `dist`.
5. *(Optional)* Add Environment Variable:
   - `VITE_API_URL`: Your live backend URL (e.g. `https://muthu-portfolio-backend.onrender.com`).
6. Deploy!

### Backend Deployment (Render)
1. Create a **New Web Service** on [Render](https://render.com/).
2. Connect this repository and set **Root Directory** to `backend`.
3. Set **Runtime** to `Python 3`.
4. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py seed_data && python manage.py collectstatic --noinput
   ```
5. Set **Start Command**:
   ```bash
   gunicorn portfolio_backend.wsgi:application
   ```
6. Add Environment Variables from your `.env`:
   - `DJANGO_SECRET_KEY`: `<secure-secret-key>`
   - `DJANGO_DEBUG`: `False`
   - `DJANGO_ALLOWED_HOSTS`: `.onrender.com,localhost,127.0.0.1`
   - `CORS_ALLOWED_ORIGINS`: `https://muthu-s-portfolio.vercel.app`

---

## 👨‍💻 Author & Contact

**Muthu Selvam M**  
*Python Full Stack Developer*  
📍 Chennai, Tamil Nadu, India  

- **🌐 Live Portfolio**: [muthu-s-portfolio.vercel.app](https://muthu-s-portfolio.vercel.app/)
- **📁 GitHub**: [@muthuselvamm472-pythonstack](https://github.com/muthuselvamm472-pythonstack)
- **💼 LinkedIn**: [linkedin.com/in/muthuselvamm472](https://www.linkedin.com/in/muthuselvamm472)
- **📧 Email**: [muthuselvamm472@gmail.com](mailto:muthuselvamm472@gmail.com)
- **📱 Phone**: +91 86789 22362

---

<div align="center">
  <sub>Built with ❤️ by Muthu Selvam M. Star ⭐ this repository if you found it useful!</sub>
</div>
