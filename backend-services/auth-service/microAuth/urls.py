from django.urls import path
from .views import G2SView

urlpatterns = [
    path("getG2S", G2SView.as_view(), name="getG2S"),
]
