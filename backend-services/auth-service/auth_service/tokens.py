import jwt
from datetime import datetime, timedelta
from django.conf import settings

ACCESS_SECRET = settings.JWT_ACCESS_SECRET
REFRESH_SECRET = settings.JWT_REFRESH_SECRET
ALGORITHM = "HS256"

ACCESS_TOKEN_LIFETIME = timedelta(minutes=5)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)

def create_access_token(user_id: str):
    payload = {
        "user_id": user_id,
        "type": "access",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + ACCESS_TOKEN_LIFETIME,
    }
    return jwt.encode(payload, ACCESS_SECRET, algorithm=ALGORITHM)

def create_refresh_token(user_id: str):
    payload = {
        "user_id": user_id,
        "type": "refresh",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + REFRESH_TOKEN_LIFETIME,
    }
    return jwt.encode(payload, REFRESH_SECRET, algorithm=ALGORITHM)

def verify_access_token(token: str):
    try:
        decoded = jwt.decode(token, ACCESS_SECRET, algorithms=[ALGORITHM])
        return decoded
    except jwt.ExpiredSignatureError:
        raise Exception("Access token expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid access token")

def verify_refresh_token(token: str):
    try:
        decoded = jwt.decode(token, REFRESH_SECRET, algorithms=[ALGORITHM])
        return decoded
    except jwt.ExpiredSignatureError:
        raise Exception("Refresh token expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid refresh token")
