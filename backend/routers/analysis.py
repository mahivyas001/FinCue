# backend/routers/analysis.py

import requests
import logging
from fastapi import APIRouter, HTTPException
from services.analysis import analyze
from models.schemas import AnalysisResponse
from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/debug/{symbol}")
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


@router.get("/{symbol}", response_model=AnalysisResponse)
def get_analysis(symbol: str):
    try:
        symbol = symbol.upper().strip()
        return analyze(symbol)
    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed for {symbol}: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed.")