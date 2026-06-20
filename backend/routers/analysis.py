# backend/routers/analysis.py

import traceback
import requests
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from services.analysis import analyze
from models.schemas import AnalysisResponse
from core.config import settings
from services.signal_log import log_signal, infer_market
from services.market_data import fetch_daily_series

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analysis"])


@router.get("/analysis/debug/{symbol}")
def debug_av(symbol: str):
    print(f"DEBUG KEY: '{settings.AV_API_KEY}'")
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol.upper(),
        "outputsize": "compact",
        "apikey": settings.AV_API_KEY,
    }
    resp = requests.get("https://www.alphavantage.co/query", params=params, timeout=10)
    return resp.json()


@router.get("/analysis/{symbol}", response_model=AnalysisResponse)
def get_analysis(symbol: str, background_tasks: BackgroundTasks):
    try:
        symbol = symbol.upper().strip()
        res = analyze(symbol)
        
        try:
            df = fetch_daily_series(symbol)
            price = float(df["close"].iloc[-1])
            market = infer_market(symbol)
            background_tasks.add_task(log_signal, symbol, market, res.signal, res.confidence, price)
        except Exception as log_err:
            logger.error(f"Failed to queue signal logging for {symbol}: {log_err}")
            
        return res
    except RuntimeError as e:
        logger.error(f"[RuntimeError] {symbol}: {e}")
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[Exception] {symbol}: {e}\n{tb}")
        print(f"[Exception] {symbol}: {e}\n{tb}")  # force print to terminal
        raise HTTPException(status_code=500, detail=str(e))
