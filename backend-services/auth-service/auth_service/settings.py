from pathlib import Path
from datetime import timedelta

# BASE & CORE CONFIG
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "HIHIAHAHAHOHO"
DEBUG = True
ALLOWED_HOSTS = ["*"]

# APPLICATIONS
INSTALLED_APPS = [
    # Core Django apps
    "django.contrib.auth",
    "django.contrib.contenttypes",
    
    # Third-party apps
    "rest_framework",
    "corsheaders",

    # Your apps
    "userAuth",
    "microAuth",
]

# MIDDLEWARE
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

# Allow all origins (for dev)
CORS_ALLOW_ALL_ORIGINS = True

# URLS & ENTRY POINTS
ROOT_URLCONF = "auth_service.urls"
WSGI_APPLICATION = "auth_service.wsgi.application"

# DATABASE
DATABASES = {}

# TEMPLATES
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {},
    },
]

# REST FRAMEWORK + JWT CONFIG
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

JWT_ACCESS_SECRET = "super-secret-access-key"
JWT_REFRESH_SECRET = "super-secret-refresh-key"

# Google OAuth credentials
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# INTERNATIONALIZATION
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_TZ = True

# STATIC FILES
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
