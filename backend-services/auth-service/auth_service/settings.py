# ============================================
# Django Settings — Auth Service (Microservice)
# ============================================

from pathlib import Path
from datetime import timedelta

# -----------------------------
# 1. BASE & CORE CONFIG
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent  # Project root path
SECRET_KEY = "replace-this-with-a-strong-secret"   # Keep secret in prod
DEBUG = True                                       # Show errors (False in prod)
ALLOWED_HOSTS = ["*"]                              # Allowed domains

# -----------------------------
# 2. APPLICATIONS
# -----------------------------
INSTALLED_APPS = [
    # Core Django apps (minimum required)
    "django.contrib.auth",          # User auth & permissions
    "django.contrib.contenttypes",  # Required by auth
    
    # Third-party apps
    "rest_framework",               # Django REST Framework (API layer)
    "corsheaders",                  # CORS for frontend communication

    # Your apps
    "userAuth",
    "microAuth",
]

# -----------------------------
# 3. MIDDLEWARE
# -----------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",  # Security headers
    "corsheaders.middleware.CorsMiddleware",          # Handles CORS requests
    "django.middleware.common.CommonMiddleware",      # Common HTTP tweaks
]

# Allow all origins (for dev)
CORS_ALLOW_ALL_ORIGINS = True

# -----------------------------
# 4. URLS & ENTRY POINTS
# -----------------------------
ROOT_URLCONF = "auth_service.urls"                  # Main URL router
WSGI_APPLICATION = "auth_service.wsgi.application"  # WSGI entry point

# -----------------------------
# 5. DATABASE
# -----------------------------
# Empty because using external DB (e.g., Mongo)
DATABASES = {}

# -----------------------------
# 6. TEMPLATES
# -----------------------------
# Still required by Django even if not used
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,   # Look inside app folders for templates
        "OPTIONS": {},      # No template context processors
    },
]

# -----------------------------
# 7. REST FRAMEWORK + JWT CONFIG
# -----------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",  # JWT auth
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",  # Require auth globally
    ),
}

JWT_ACCESS_SECRET = "super-secret-access-key"
JWT_REFRESH_SECRET = "super-secret-refresh-key"

# -----------------------------
# 8. Google OAuth credentials
# -----------------------------
GOOGLE_CLIENT_ID = "your-google-client-id"
GOOGLE_CLIENT_SECRET = "your-google-client-secret"

# -----------------------------
# 9. INTERNATIONALIZATION
# -----------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_TZ = True

# -----------------------------
# 10. STATIC FILES
# -----------------------------
STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
