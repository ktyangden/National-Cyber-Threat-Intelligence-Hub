import jwt
from fastapi import Header, HTTPException, Depends
from typing import Optional

G2S_SECRET = "ml-secret-key"  

def verify_g2s_token(authorization: Optional[str] = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing G2S token")

    token = authorization.split(" ")[1]

    try:
        decoded = jwt.decode(token, G2S_SECRET, algorithms=["HS256"])
        return decoded  # attach decoded data for view usage
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
