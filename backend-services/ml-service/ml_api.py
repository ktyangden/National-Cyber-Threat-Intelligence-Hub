# main.py
from fastapi import FastAPI
from pydantic import BaseModel, Extra
from typing import Optional
import random

app = FastAPI(title="Minimal Attack Classifier")

class LogRecord(BaseModel):
    
    timestamp: str
    src_ip: str
    username: Optional[str] = None
    password: Optional[str] = None
    eventid: Optional[str] = None
    message: Optional[str] = None

@app.post("/predict")
def predict(record: LogRecord):
    """
    Adds only three fields to the incoming log and returns the full log.
    The incoming 'timestamp' is preserved as-is.
    """
    isAttack = random.choice([True, False])
    attackType = random.choice(["Brute Force", "Other"])
    confidence = float(random.random())  # 0.0 - 1.0

    out = record.dict()  
    out.update({
        "isAttack": isAttack,
        "attackType": attackType,
        "confidence": confidence
    })
    return out

@app.get("/")
def root():
    return {"message": "Attack Classification Service is up"}
