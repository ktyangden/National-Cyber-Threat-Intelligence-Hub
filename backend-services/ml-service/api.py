from fastapi import FastAPI, Request
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import math

app = FastAPI(title="Honeypot Log Classifier", version="1.0")

# ========================== Utility Functions ==========================

def shannon_entropy(s: Optional[str]) -> float:
    """Calculate entropy of a string."""
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
    return -sum([p * math.log(p, 2) for p in prob])


# ========================== Feature Extraction ==========================

def extract_features(current_log: dict, recent_logs: list):
    """Extract relevant features from recent logs (already windowed)."""
    src_ip = current_log["src_ip"]

    # Only consider logs from same IP
    logs_window = [log for log in recent_logs if log["src_ip"] == src_ip]

    total_attempts = len(logs_window)
    failed_attempts = sum(1 for log in logs_window if "failed" in log["eventid"])
    failed_ratio = failed_attempts / total_attempts if total_attempts > 0 else 0

    usernames = [log["username"] for log in logs_window if log.get("username")]
    passwords = [log["password"] for log in logs_window if log.get("password")]

    unique_usernames = len(set(usernames))
    unique_passwords = len(set(passwords))

    username_entropy = (
        sum(shannon_entropy(u) for u in usernames) / len(usernames)
        if usernames else 0
    )
    password_entropy = (
        sum(shannon_entropy(p) for p in passwords) / len(passwords)
        if passwords else 0
    )

    return {
        "attempts_from_ip_last_1min": total_attempts,
        "failed_attempt_ratio_last_1min": failed_ratio,
        "unique_usernames_from_ip_last_1min": unique_usernames,
        "unique_passwords_from_ip_last_1min": unique_passwords,
        "username_entropy": username_entropy,
        "password_entropy": password_entropy,
    }


# ========================== Rule-Based Classification ==========================

def classify_attack_basic(features):
    """Binary classification: benign / attack / suspicious"""
    attempts = features["attempts_from_ip_last_1min"]
    fail_ratio = features["failed_attempt_ratio_last_1min"]
    entropy_u = features["username_entropy"]
    entropy_p = features["password_entropy"]
    uniq_users = features["unique_usernames_from_ip_last_1min"]

    if attempts > 10 and fail_ratio > 0.8:
        return "attack"
    if uniq_users > 5 and fail_ratio > 0.9:
        return "attack"
    if entropy_u > 3.5 or entropy_p > 3.5:
        return "suspicious"

    return "benign"


def classify_attack_type(features):
    """Multiclass classification if attack detected."""
    uniq_users = features["unique_usernames_from_ip_last_1min"]
    uniq_pwds = features["unique_passwords_from_ip_last_1min"]
    entropy_u = features["username_entropy"]
    entropy_p = features["password_entropy"]

    # Rule mapping
    if uniq_pwds > 5 and uniq_users <= 2:
        return "brute_force"
    if uniq_users > 5 and uniq_pwds <= 3:
        return "credential_stuffing"
    if uniq_users > 5 and uniq_pwds > 5:
        return "dictionary_attack"
    if entropy_u > 3.5 or entropy_p > 3.5:
        return "bot_login"

    return "unknown_attack"


# ========================== FastAPI Schema ==========================

class LogEntry(BaseModel):
    timestamp: int
    src_ip: str
    username: Optional[str] = None
    password: Optional[str] = None
    eventid: str
    message: str


class InputData(BaseModel):
    current_log: LogEntry
    recent_logs: List[LogEntry]


# ========================== Prediction Endpoint ==========================

@app.post("/predict")
async def predict_attack(data: InputData):
    """Predict if a login attempt is benign, suspicious, or attack."""
    current_log = data.current_log.dict()
    recent_logs = [log.dict() for log in data.recent_logs]

    features = extract_features(current_log, recent_logs)
    classification = classify_attack_basic(features)

    result = {
        "ip": current_log["src_ip"],
        "classification": classification,
        "features": features,
    }

    if classification == "attack":
        result["attack_type"] = classify_attack_type(features)
    elif classification == "suspicious":
        result["attack_type"] = "potential_scan"

    return result


# ========================== Root Route ==========================

@app.get("/")
def root():
    return {"status": "running", "message": "Honeypot Log Classifier API"}


# ========================== Run Locally ==========================
# Run using: uvicorn main:app --reload
