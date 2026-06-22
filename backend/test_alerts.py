import asyncio
import os
import sys

# Ensure backend directory is in the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.alert_store import register_watch, get_recent_alerts, _last_known_state, update_last_known_state
from services.alert_engine import check_for_alerts

async def main():
    print("--- 1. Registering test push token with AAPL and TSLA ---")
    push_token = "ExponentPushToken[Test123456789]"
    register_watch(push_token, ["AAPL", "TSLA"])
    
    print("\n--- 2. First Run: checking for alerts (should just store state) ---")
    await check_for_alerts()
    print("Last known state for AAPL:", _last_known_state.get("AAPL"))
    print("Last known state for TSLA:", _last_known_state.get("TSLA"))
    
    print("\n--- 3. MOCKING analyze to trigger alerts ---")
    import services.alert_engine as engine
    
    class FakeIndicators:
        rsi = 80.0
        volume_level = "High"
        
    class FakeAnalysis:
        signal = "Bullish"
        confidence = 90
        indicators = FakeIndicators()
        
    async def fake_analyze(sym):
        return FakeAnalysis()
        
    async def fake_fetch(sym):
        import pandas as pd
        return pd.DataFrame({"volume": [1000, 1000, 5000]})
        
    engine.analyze = lambda sym: FakeAnalysis()
    engine.fetch_daily_series = lambda sym: __import__('pandas').DataFrame({"volume": [1000]*20 + [5000]})
    
    # Fake the last state so current triggers alerts
    update_last_known_state("AAPL", {"signal": "Neutral", "rsi": 50.0, "volume": "Normal"})
    update_last_known_state("TSLA", {"signal": "Neutral", "rsi": 50.0, "volume": "Normal"})
    
    print("\n--- 4. Second Run: checking for alerts ---")
    await check_for_alerts()
    
    print("\n--- 5. Fetching generated alerts ---")
    alerts = get_recent_alerts(push_token)
    if not alerts:
        print("No alerts generated.")
    else:
        for a in alerts:
            print(f"[{a.alert_type}] {a.symbol}: {a.message}")

if __name__ == "__main__":
    asyncio.run(main())
