from pathlib import Path

# Base & core congif
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-h%*m&_cqhn(t#t(vld%%(l&d$h3&u@6ao+pt&-qx1i8%8)w#t3'
DEBUG = True
ALLOWED_HOSTS = ["*"]

# Applications
INSTALLED_APPS = [
    # Core essentials
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'channels',

    # Additional Apps
    'logs',
]

# Middlewares
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# Allow CORS
CORS_ALLOW_ALL_ORIGINS = True

# URLs & Entry POints
ROOT_URLCONF = 'log_service.urls'
WSGI_APPLICATION = 'log_service.wsgi.application'
ASGI_APPLICATION = 'log_service.asgi.application'

# Database
DATABASES = {}

#Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

# Channels — In-memory or Redis layer for WebSocket broadcasting
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
        # For production:
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {"hosts": [("127.0.0.1", 6379)]},
    },
}


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'