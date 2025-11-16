from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import math

app = FastAPI(title="Adaptive Honeypot Log Classifier", version="3.0")

# ========================== Utility Functions ==========================

def shannon_entropy(s: Optional[str]) -> float:
    """Calculate Shannon entropy of a string."""
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
    return -sum(p * math.log(p, 2) for p in prob)

def avg_time_gap(logs_window):
    """Compute average time gap (ms) between consecutive events."""
    timestamps = sorted(log["timestamp"] for log in logs_window)
    if len(timestamps) < 2:
        return 999999.0
    deltas = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
    return sum(deltas) / len(deltas)

def reuse_rate(logs_window):
    """Compute reuse ratio of (username, password) pairs."""
    total = len(logs_window)
    if total == 0:
        return 0.0
    creds = [(log.get("username"), log.get("password")) for log in logs_window]
    unique_creds = len(set(creds))
    return 1.0 - (unique_creds / total)

# ========================== Feature Extraction ==========================

def extract_features(current_log: dict, recent_logs: list):
    """Extract relevant statistical and contextual features."""
    src_ip = current_log["src_ip"]
    logs_window = [log for log in recent_logs if log["src_ip"] == src_ip]

    total_attempts = len(logs_window)
    failed_attempts = sum(1 for log in logs_window if "failed" in log["eventid"])
    success_attempts = sum(1 for log in logs_window if "success" in log["eventid"])
    failed_ratio = failed_attempts / total_attempts if total_attempts else 0

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

    avg_delay = avg_time_gap(logs_window)
    reuse_ratio = reuse_rate(logs_window)

    # Derived
    attempts_per_min = total_attempts  # assuming window is 1 minute
    success_ratio = success_attempts / total_attempts if total_attempts else 0

    return {
        "attempts_from_ip_last_1min": total_attempts,
        "failed_attempt_ratio_last_1min": failed_ratio,
        "unique_usernames_from_ip_last_1min": unique_usernames,
        "unique_passwords_from_ip_last_1min": unique_passwords,
        "username_entropy": username_entropy,
        "password_entropy": password_entropy,
        "avg_delay_ms_between_attempts": avg_delay,
        "success_attempts": success_attempts,
        "attempts_per_min": attempts_per_min,
        "reuse_ratio": reuse_ratio,
        "success_ratio": success_ratio,
    }

# ========================== Classification Rules ==========================

def classify_attack_basic(features, current_log=None):
    """
    Classify log as benign / suspicious / attack.
    Returns: (label: str, risk_score: float)
    """
    attempts = features["attempts_from_ip_last_1min"]
    fail_ratio = features["failed_attempt_ratio_last_1min"]
    uniq_users = features["unique_usernames_from_ip_last_1min"]
    uniq_pwds = features["unique_passwords_from_ip_last_1min"]
    avg_delay = features["avg_delay_ms_between_attempts"]
    entropy_u = features["username_entropy"]
    entropy_p = features["password_entropy"]
    success_ratio = features["success_ratio"]
    reuse = features["reuse_ratio"]

    # Honeypot: any success → high-risk attack
    if current_log and "success" in current_log["eventid"]:
        return "attack", 0.98

    # Strong brute-force pattern
    if attempts >= 10 and fail_ratio >= 0.8 and avg_delay < 2000:
        return "attack", 0.93

    # Rapid automated access
    if avg_delay < 1000 or attempts > 20:
        return "attack", 0.9

    # Many usernames or passwords → suspicious enumeration
    if uniq_users > 5 or uniq_pwds > 5:
        return "suspicious", 0.65

    # High entropy credentials → possible bot
    if entropy_u > 3.0 or entropy_p > 3.0:
        return "suspicious", 0.6

    # Moderate activity but some reuse → mild suspicion
    if reuse > 0.3 and fail_ratio > 0.5:
        return "suspicious", 0.55

    # Low attempts, normal delay → benign
    return "benign", 0.2

def classify_attack_type(features):
    """
    Multi-class subtype classification for confirmed attacks.
    Returns: (attack_type: str, confidence: float)
    """
    attempts = features["attempts_from_ip_last_1min"]
    uniq_users = features["unique_usernames_from_ip_last_1min"]
    uniq_pwds = features["unique_passwords_from_ip_last_1min"]
    entropy_u = features["username_entropy"]
    entropy_p = features["password_entropy"]
    avg_delay = features["avg_delay_ms_between_attempts"]
    reuse = features["reuse_ratio"]
    success_ratio = features["success_ratio"]

    # Brute-force: few users, many passwords, fast attempts
    if uniq_users <= 2 and uniq_pwds >= 6 and avg_delay < 2000:
        return "brute_force", 0.9

    # Credential stuffing: many users, few passwords, some successes
    if uniq_users >= 5 and uniq_pwds <= 3 and success_ratio > 0.0:
        return "credential_stuffing", 0.85

    # Dictionary attack: many usernames + many passwords, low entropy
    if uniq_users >= 4 and uniq_pwds >= 6 and (entropy_p < 3.0):
        return "dictionary_attack", 0.8

    # Bot login: very low delay, high entropy credentials
    if avg_delay < 800 and (entropy_u > 2.5 or entropy_p > 2.5):
        return "bot_login", 0.75

    # Username enumeration: many usernames, low password variety
    if uniq_users >= 10 and uniq_pwds <= 3:
        return "username_enumeration", 0.7

    # Password spray: one/few passwords across many usernames, slow rate
    if uniq_pwds <= 2 and uniq_users >= 8 and avg_delay > 2000:
        return "password_spray", 0.8

    # Otherwise
    return "unknown_attack", 0.4

# ========================== FastAPI Schemas ==========================

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

# ========================== Endpoint ==========================

@app.post("/predict")
async def predict_attack(data: InputData):
    """Predict if a login attempt is benign, suspicious, or attack."""
    current_log = data.current_log.dict()
    recent_logs = [log.dict() for log in data.recent_logs]

    features = extract_features(current_log, recent_logs)
    classification, risk_score = classify_attack_basic(features, current_log)

    result = {
        "ip": current_log["src_ip"],
        "username": current_log["username"],
        "password": current_log["password"],
        "message": current_log["message"],
        "classification": classification,
        "risk_score": round(risk_score, 2),
        "features": features,
    }

    if classification == "attack":
        attack_type, conf = classify_attack_type(features)
        result["attack_type"] = attack_type
        result["attack_confidence"] = conf
    elif classification == "suspicious":
        result["attack_type"] = "potential_scan"
        result["attack_confidence"] = 0.5
    else:
        result["attack_type"] = "none"
        result["attack_confidence"] = 0.1

    return result

# ========================== Root ==========================

@app.get("/")
def root():
    return {
        "status": "running",
        "version": "3.0",
        "message": "Adaptive Honeypot Log Classifier API",
    }


# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List, Optional
# from datetime import datetime
# import math

# app = FastAPI(title="Improved Honeypot Log Classifier", version="2.0")

# # ========================== Utility Functions ==========================

# def shannon_entropy(s: Optional[str]) -> float:
#     """Calculate entropy of a string."""
#     if not s:
#         return 0.0
#     prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
#     return -sum([p * math.log(p, 2) for p in prob])

# def avg_time_gap(logs_window):
#     """Compute average time gap (ms) between consecutive events."""
#     timestamps = sorted(log["timestamp"] for log in logs_window)
#     if len(timestamps) < 2:
#         return None
#     deltas = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
#     return sum(deltas) / len(deltas)

# # ========================== Feature Extraction ==========================

# def extract_features(current_log: dict, recent_logs: list):
#     """Extract relevant statistical and contextual features."""
#     src_ip = current_log["src_ip"]
#     logs_window = [log for log in recent_logs if log["src_ip"] == src_ip]

#     total_attempts = len(logs_window)
#     failed_attempts = sum(1 for log in logs_window if "failed" in log["eventid"])
#     success_attempts = sum(1 for log in logs_window if "success" in log["eventid"])
#     failed_ratio = failed_attempts / total_attempts if total_attempts > 0 else 0

#     usernames = [log["username"] for log in logs_window if log.get("username")]
#     passwords = [log["password"] for log in logs_window if log.get("password")]

#     unique_usernames = len(set(usernames))
#     unique_passwords = len(set(passwords))

#     username_entropy = (
#         sum(shannon_entropy(u) for u in usernames) / len(usernames)
#         if usernames else 0
#     )
#     password_entropy = (
#         sum(shannon_entropy(p) for p in passwords) / len(passwords)
#         if passwords else 0
#     )

#     avg_delay = avg_time_gap(logs_window) or 999999  # default large if sparse

#     return {
#         "attempts_from_ip_last_1min": total_attempts,
#         "failed_attempt_ratio_last_1min": failed_ratio,
#         "unique_usernames_from_ip_last_1min": unique_usernames,
#         "unique_passwords_from_ip_last_1min": unique_passwords,
#         "username_entropy": username_entropy,
#         "password_entropy": password_entropy,
#         "avg_delay_ms_between_attempts": avg_delay,
#         "success_attempts": success_attempts,
#     }

# # ========================== Rule-Based Classification ==========================

# def classify_attack_basic(features, current_log=None):
#     """Improved rule-based classifier with risk scoring."""
#     attempts = features["attempts_from_ip_last_1min"]
#     fail_ratio = features["failed_attempt_ratio_last_1min"]
#     entropy_u = features["username_entropy"]
#     entropy_p = features["password_entropy"]
#     uniq_users = features["unique_usernames_from_ip_last_1min"]
#     uniq_pwds = features["unique_passwords_from_ip_last_1min"]
#     avg_delay = features["avg_delay_ms_between_attempts"]
#     success_attempts = features["success_attempts"]

#     # Honeypot direct rule: any successful login is malicious
#     if current_log and "success" in current_log["eventid"]:
#         return "attack", 0.95

#     # Brute-force or rapid scanning
#     if attempts > 10 and fail_ratio > 0.8:
#         return "attack", 0.9

#     # Rapid connections (automation)
#     if avg_delay < 5000:  # <5s between attempts
#         return "attack", 0.85

#     # Multiple usernames/passwords tried → suspicious
#     if (uniq_users > 3 or uniq_pwds > 3) and (entropy_u > 2.5 or entropy_p > 2.5):
#         return "suspicious", 0.6

#     # Too many usernames attempted even if not failing much
#     if uniq_users > 5:
#         return "suspicious", 0.5

#     # Default (benign / low activity)  non_malicious_or_scan
#     return "benign", 0.2

# def classify_attack_type(features):
#     """Classify attack subtype if confirmed attack."""
#     uniq_users = features["unique_usernames_from_ip_last_1min"]
#     uniq_pwds = features["unique_passwords_from_ip_last_1min"]
#     entropy_u = features["username_entropy"]
#     entropy_p = features["password_entropy"]

#     if uniq_pwds > 5 and uniq_users <= 2:
#         return "brute_force"
#     if uniq_users > 5 and uniq_pwds <= 3:
#         return "credential_stuffing"
#     if uniq_users > 5 and uniq_pwds > 5:
#         return "dictionary_attack"
#     if entropy_u > 2.5 or entropy_p > 2.5:
#         return "bot_login"

#     return "unknown_attack"

# # ========================== FastAPI Schemas ==========================

# class LogEntry(BaseModel):
#     timestamp: int
#     src_ip: str
#     username: Optional[str] = None
#     password: Optional[str] = None
#     eventid: str
#     message: str

# class InputData(BaseModel):
#     current_log: LogEntry
#     recent_logs: List[LogEntry]

# # ========================== Prediction Endpoint ==========================

# @app.post("/predict")
# async def predict_attack(data: InputData):
#     """Predict if a login attempt is benign, suspicious, or attack."""
#     current_log = data.current_log.dict()
#     recent_logs = [log.dict() for log in data.recent_logs]

#     features = extract_features(current_log, recent_logs)
#     classification, risk_score = classify_attack_basic(features, current_log)

#     result = {
#         "ip": current_log["src_ip"],
#         "username": current_log["username"],
#         "password": current_log["password"],
#         "message": current_log["message"],
#         "classification": classification,
#         "risk_score": round(risk_score, 2),
#         "features": features,
#     }

#     if classification == "attack":
#         result["attack_type"] = classify_attack_type(features)
#     elif classification == "suspicious":
#         result["attack_type"] = "potential_scan"

#     return result

# # ========================== Root Route ==========================

# @app.get("/")
# def root():
#     return {"status": "running", "message": "Improved Honeypot Log Classifier API v2"}
