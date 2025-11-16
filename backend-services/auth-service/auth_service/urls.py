from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Auth Service API running"})

urlpatterns = [
    path("api/auth/", include("authentication.urls")),
    path('', home ),
]