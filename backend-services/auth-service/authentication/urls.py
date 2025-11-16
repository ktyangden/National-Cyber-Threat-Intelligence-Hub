from django.urls import path
from .views import RegisterView, LoginView, GoogleView, RefreshView, GetDataView

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login", LoginView.as_view(), name="login"),

    path("google", GoogleView.as_view(), name="google"),

    path("refresh", RefreshView.as_view(), name="refresh"),

    path("getData", GetDataView.as_view(), name="getData"),
]
