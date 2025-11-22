from django.urls import path
from django.utils.decorators import decorator_from_middleware
from .views import send_log
from .middleware import VerifyG2SMiddleware

verify_token = decorator_from_middleware(VerifyG2SMiddleware)

urlpatterns = [
    path('send-log', verify_token(send_log), name='send-log'),
]
