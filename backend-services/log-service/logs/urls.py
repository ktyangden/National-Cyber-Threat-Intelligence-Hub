from django.urls import path
from django.utils.decorators import decorator_from_middleware
from .views import send_log, get_country_counts, reset_country_counts, get_recent_logs, get_persistent_stats
from .middleware import VerifyG2SMiddleware

verify_token = decorator_from_middleware(VerifyG2SMiddleware)

urlpatterns = [
    path('send-log', verify_token(send_log), name='send-log'),
    path('country-counts', get_country_counts, name='country-counts'),
    path('reset-counts', reset_country_counts, name='reset-counts'),
    path('recent-logs', get_recent_logs, name='recent-logs'),
    path('persistent-stats', get_persistent_stats),
]
