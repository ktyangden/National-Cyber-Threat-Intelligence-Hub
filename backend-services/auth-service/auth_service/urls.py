from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Auth Service API running"})

urlpatterns = [
    path("api/auth/", include("userAuth.urls")),
    path("micro/auth/", include("microAuth.urls")),
    path('', home ),
]