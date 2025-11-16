#import bcrypt
from .db import users_collection

def create_user(email, password):
    # Hash password
    #hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user = {
        "email": email,
        "password": password, #hashed_pw,
    }
    users_collection.insert_one(user)
    return user

def verify_user(email, password):
    user = users_collection.find_one({"email": email})
    if (user and password== user["password"]): #bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return user
    return None