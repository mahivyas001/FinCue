from fastapi import APIRouter
from models.alerts import WatchRegistration, AlertEvent, TokenRequest
from services.alert_store import register_watch, get_recent_alerts, clear_alerts
from services.alert_engine import check_for_alerts

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

@router.post("/clear")
def clear_device_alerts(req: TokenRequest):
    """Clear recent alerts for a device push token."""
    clear_alerts(req.push_token)
    return {"status": "ok", "message": "Cleared alerts for device"}

@router.post("/check")
async def trigger_alerts_check():
    """Manually trigger alert detection check."""
    await check_for_alerts()
    return {"status": "ok", "message": "Manual alert check completed"}
