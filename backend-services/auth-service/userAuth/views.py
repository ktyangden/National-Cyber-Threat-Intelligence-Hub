from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from bson import ObjectId
from django.conf import settings
import requests

from .auth_utils import create_user, verify_user
from .db import users_collection
from .serializers import UserSerializer
from auth_service.tokens import ( create_access_token, create_refresh_token, verify_refresh_token, )

# ============================
# Register View
# ============================
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Missing fields"}, status=400)

        user = create_user(email, password)
        return Response({"msg": "User registered successfully"}, status=201)


# ============================
# Login View
# ============================
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = verify_user(email, password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        user_id = str(user["_id"])
        access = create_access_token(user_id)
        refresh = create_refresh_token(user_id)

        return Response({
            "access": access,
            "refresh": refresh,
        }, status=200)


# ============================
# Google OAuth View
# ============================
class GoogleView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"message": "Authorization code required"}, status=400)

        try:
            token_response = requests.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": "postmessage",
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            if token_response.status_code != 200:
                return Response(
                    {"message": "Failed to fetch Google tokens", "error": token_response.json()},
                    status=token_response.status_code,
                )

            access_token = token_response.json().get("access_token")

            user_info = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if user_info.status_code != 200:
                return Response(
                    {"message": "Failed to fetch Google user info"},
                    status=user_info.status_code,
                )

            data = user_info.json()
            google_id = data.get("sub")
            email = data.get("email")
            name = data.get("name")

            user = users_collection.find_one({"email": email})
            if not user:
                user_data = {
                    "username": name,
                    "email": email,
                    "authProvider": "google",
                    "googleId": google_id,
                }
                users_collection.insert_one(user_data)
                user = users_collection.find_one({"email": email})

            user_id = str(user["_id"])
            access = create_access_token(user_id)
            refresh = create_refresh_token(user_id)

            return Response({
                "message": "Google login successful",
                "user": {"username": user.get("username"), "email": user.get("email")},
                "access": access,
                "refresh": refresh,
            }, status=200)

        except Exception as e:
            print("Google login error:", str(e))
            return Response({"message": "Google login failed"}, status=500)


# ============================
# Refresh Token View
# ============================
class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refreshToken")
        if not refresh_token:
            return Response({"message": "No refresh token provided"}, status=401)

        try:
            decoded = verify_refresh_token(refresh_token)
            user_id = decoded.get("user_id")
            if not user_id:
                return Response({"message": "Invalid token payload"}, status=403)

            new_access = create_access_token(user_id)
            return Response({
                "message": "Access token refreshed successfully",
                "access": new_access,
            }, status=201)

        except Exception as e:
            print("Token refresh error:", str(e))
            return Response({"message": str(e)}, status=403)


# ============================
# Get User Data View
# ============================
class GetDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("userId")
        if not user_id:
            return Response({"error": "Missing userId"}, status=400)

        try:
            if not ObjectId.is_valid(user_id):
                return Response({"error": "Invalid userId format"}, status=400)

            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return Response({"error": "User not found"}, status=404)

            user_data = {
                "id": str(user["_id"]),
                "username": user.get("email", "").split("@")[0],
                "email": user.get("email"),
                "password": user.get("password"),
            }

            serializer = UserSerializer(user_data)
            return Response(serializer.data, status=200)

        except Exception as e:
            print("Error getting data:", e)
            return Response({"error": "Server error"}, status=500)
