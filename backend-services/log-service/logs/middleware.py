import jwt
from django.http import JsonResponse
from django.conf import settings

G2S_SECRET = "log-secret-key"  # keep in env

class VerifyG2SMiddleware:
    def __init__(self, get_response=None):
        self.get_response = get_response

    def __call__(self, request):
        # Should NOT run globally
        return self.get_response(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Missing G2S token"}, status=401)

        token = auth_header.split(" ")[1]

        try:
            decoded = jwt.decode(token, G2S_SECRET, algorithms=["HS256"])
            request.g2s_data = decoded  # attach decoded info
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)

        return None
