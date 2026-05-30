# backend/routers/analysis.py

from fastapi import APIRouter, HTTPException
from services.analysis import analyze
from models.schemas import AnalysisResponse
import logging

logger    = logging.getLogger(__name__)
router    = APIRouter(prefix="/analysis", tags=["analysis"])

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