from pydantic import BaseModel
from typing import List
from datetime import datetime

class TokenRequest(BaseModel):
    push_token: str

class WatchRegistration(BaseModel):
    push_token: str
    symbols: List[str]

class AlertEvent(BaseModel):
    push_token: str
    symbol: str
    alert_type: str
    message: str
    triggered_at: datetime
    acknowledged: bool = False
