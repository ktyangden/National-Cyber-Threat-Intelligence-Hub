import time
import jwt
import json
from django.http import JsonResponse
from django.views import View
from django.conf import settings

# Store microservice keys in settings.py for security
SERVICE_KEYS = {
    "mlService": getattr(settings, "ML_SERVICE_KEY", "ml-secret-key"),
    "logService": getattr(settings, "LOG_SERVICE_KEY", "log-secret-key"),
}

TOKEN_TTL = 60 * 5  # 5 minutes

class G2SView(View):
    def post(self, request):
        print("RAW BODY:", request.body)
        try:
            body = json.loads(request.body.decode("utf-8"))
            target = body.get("targetService")

            if not target:
                return JsonResponse({"error": "targetService missing"}, status=400)

            if target not in SERVICE_KEYS:
                return JsonResponse({"error": "Invalid targetService"}, status=400)

            service_key = SERVICE_KEYS[target]

            # Token payload
            payload = {
                "service": "gateway",
                "target": target,
                "exp": int(time.time()) + TOKEN_TTL,
            }

            token = jwt.encode(payload, service_key, algorithm="HS256")

            return JsonResponse({"token": token})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
