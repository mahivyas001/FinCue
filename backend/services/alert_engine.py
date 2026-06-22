import asyncio
import logging
from datetime import datetime, timezone
import traceback
import httpx

from services.alert_store import (
    get_all_watched_symbols,
    get_tokens_watching,
    get_last_known_state,
    update_last_known_state,
    add_alert_event,
)
from models.alerts import AlertEvent
from services.analysis import analyze
from services.market_data import fetch_daily_series

logger = logging.getLogger(__name__)

async def send_push_notification(push_token: str, title: str, body: str, data: dict):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://exp.host/--/api/v2/push/send",
            json={
                "to": push_token,
                "title": title,
                "body": body,
                "data": data,  # include {"symbol": symbol} so the
                                # frontend can navigate on tap
            },
            headers={"Content-Type": "application/json"},
            timeout=10.0,
        )
    if resp.status_code != 200:
        logger.warning(f"Push send failed for {push_token}: {resp.text}")
    return resp.json()

async def check_for_alerts():
    """
    Periodic job to check all watched symbols for alert conditions.
    Rules:
    - Never predict future price movement or direction.
    - Only factual language.
    - High confidence (>= 65) required for signal flips.
    """
    logger.info("[AlertEngine] Starting check_for_alerts run")
    symbols = get_all_watched_symbols()
    if not symbols:
        logger.info("[AlertEngine] No symbols currently watched. Skipping.")
        return

    for sym in symbols:
        try:
            # Run existing analysis synchronously in a thread thread to avoid blocking the event loop
            res = await asyncio.to_thread(analyze, sym)
            
            # Get underlying data for specific metrics like volume multiplier
            df = await asyncio.to_thread(fetch_daily_series, sym)
            
            latest_rsi = res.indicators.rsi
            latest_signal = res.signal.capitalize() # Bullish, Bearish, Neutral
            volume_status = res.indicators.volume_level
            
            # calculate volume ratio for the template
            avg_vol = df["volume"].rolling(20).mean().iloc[-1]
            latest_vol = df["volume"].iloc[-1]
            vol_ratio = round(latest_vol / avg_vol, 1) if avg_vol > 0 else 1.0

            current_state = {
                "signal": latest_signal,
                "rsi": latest_rsi,
                "volume": volume_status
            }

            last_state = get_last_known_state(sym)
            if not last_state:
                # First time seeing this symbol, just store state, don't alert
                update_last_known_state(sym, current_state)
                continue

            alerts_to_fire = []

            # 1. Check Signal Flips (Only if confidence is high, e.g., >= 65)
            if res.confidence >= 65:
                if latest_signal != last_state["signal"]:
                    if latest_signal == "Bullish":
                        alerts_to_fire.append({
                            "type": "signal_flip",
                            "msg": f"{sym} turned Bullish — MACD moved to Bullish"
                        })
                    elif latest_signal == "Bearish":
                        alerts_to_fire.append({
                            "type": "signal_flip",
                            "msg": f"{sym} turned Bearish — MACD moved to Bearish"
                        })

            # 2. Check RSI Extremes
            if latest_rsi >= 70 and last_state["rsi"] < 70:
                alerts_to_fire.append({
                    "type": "rsi_extreme",
                    "msg": f"{sym} RSI reached {latest_rsi} (overbought territory)"
                })
            elif latest_rsi <= 30 and last_state["rsi"] > 30:
                alerts_to_fire.append({
                    "type": "rsi_extreme",
                    "msg": f"{sym} RSI reached {latest_rsi} (oversold territory)"
                })

            # 3. Check Volume Spike
            if volume_status == "High" and last_state["volume"] != "High":
                alerts_to_fire.append({
                    "type": "volume_spike",
                    "msg": f"{sym} volume is {vol_ratio}x its recent average"
                })

            # Fan out alerts if any
            if alerts_to_fire:
                tokens = get_tokens_watching(sym)
                now = datetime.now(timezone.utc)
                for alert in alerts_to_fire:
                    logger.info(f"[AlertEngine] Firing alert for {sym}: {alert['msg']}")
                    for token in tokens:
                        event = AlertEvent(
                            push_token=token,
                            symbol=sym,
                            alert_type=alert["type"],
                            message=alert["msg"],
                            triggered_at=now
                        )
                        add_alert_event(token, event)
                        # Send real push notification via Expo
                        try:
                            await send_push_notification(
                                push_token=token,
                                title=f"FinCue Alert: {sym}",
                                body=alert["msg"],
                                data={"symbol": sym}
                            )
                        except Exception as pe:
                            logger.error(f"[AlertEngine] Failed to send push to {token}: {pe}")

            # Update state regardless
            update_last_known_state(sym, current_state)

        except Exception as e:
            logger.error(f"[AlertEngine] Failed to process {sym}: {e}")
            logger.debug(traceback.format_exc())


async def alert_scheduler_loop():
    """Runs check_for_alerts periodically."""
    logger.info("[AlertEngine] Scheduler started")
    while True:
        try:
            # Simple time-of-day check for market hours could be added here
            now = datetime.now()
            # For now, run unconditionally every 15 minutes
            await check_for_alerts()
        except Exception as e:
            logger.error(f"[AlertEngine] Loop error: {e}")
        
        # Sleep 15 minutes (900 seconds)
        await asyncio.sleep(900)
