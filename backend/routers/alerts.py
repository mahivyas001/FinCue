from fastapi import APIRouter
from models.alerts import WatchRegistration, AlertEvent
from services.alert_store import register_watch, get_recent_alerts

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])

@router.post("/register")
def register_device_watch(registration: WatchRegistration):
    """Register or update the watched symbols for a device push token."""
    register_watch(registration.push_token, registration.symbols)
    return {"status": "ok", "message": f"Registered {len(registration.symbols)} symbols for device"}

@router.get("/recent", response_model=list[AlertEvent])
def get_recent_device_alerts(push_token: str):
    """Retrieve recent alerts for a given push token."""
    return get_recent_alerts(push_token)
