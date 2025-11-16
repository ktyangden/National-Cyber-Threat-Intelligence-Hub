from django.urls import path
from .views import send_log

urlpatterns = [
    path('send-log', send_log, name='send-log'),
]
