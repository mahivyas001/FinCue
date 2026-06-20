# backend/routers/track_record.py

import sqlite3
import time
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.signal_log import DB_PATH
from services.track_record import evaluate_pending_outcomes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/track-record", tags=["track-record"])

class ConfidenceBucket(BaseModel):
    range: str
    bullish_count: int
    bullish_correct_pct: Optional[float]
    bearish_count: int
    bearish_correct_pct: Optional[float]

class TrackRecordSummary(BaseModel):
    total_signals_logged: int
    total_evaluated: int
    min_sample_size_met: bool
    confidence_buckets: List[ConfidenceBucket]
    last_updated: int

@router.get("/summary", response_model=TrackRecordSummary)
async def get_track_record_summary():
    # 1. Run lazy outcome evaluation on pending rows first
    await evaluate_pending_outcomes()

    # 2. Query and aggregate stats
    total_signals_logged = 0
    total_evaluated = 0
    
    # Initialize empty buckets structure
    buckets = {
        "50-65": {"bullish_total": 0, "bullish_correct": 0, "bearish_total": 0, "bearish_correct": 0},
        "65-80": {"bullish_total": 0, "bullish_correct": 0, "bearish_total": 0, "bearish_correct": 0},
        "80-99": {"bullish_total": 0, "bullish_correct": 0, "bearish_total": 0, "bearish_correct": 0},
    }

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get total logged
        cursor.execute("SELECT COUNT(*) FROM signal_logs")
        total_signals_logged = cursor.fetchone()[0]

        # Get all evaluated signals
        cursor.execute("""
            SELECT signal_type, confidence, outcome_pct_change
            FROM signal_logs
            WHERE outcome_evaluated_at IS NOT NULL
        """)
        evaluated_rows = cursor.fetchall()
        total_evaluated = len(evaluated_rows)
        conn.close()

        for row in evaluated_rows:
            sig_type = row["signal_type"].capitalize()
            conf = row["confidence"]
            pct_change = row["outcome_pct_change"]

            # Assign bucket range name
            if 50 <= conf < 65:
                bucket_range = "50-65"
            elif 65 <= conf < 80:
                bucket_range = "65-80"
            elif 80 <= conf <= 100:
                bucket_range = "80-99"
            else:
                continue

            if sig_type == "Bullish":
                buckets[bucket_range]["bullish_total"] += 1
                if pct_change > 0:
                    buckets[bucket_range]["bullish_correct"] += 1
            elif sig_type == "Bearish":
                buckets[bucket_range]["bearish_total"] += 1
                if pct_change < 0:
                    buckets[bucket_range]["bearish_correct"] += 1

    except Exception as e:
        logger.error(f"Failed to query signal logs for summary: {e}")

    # Build Pydantic model response list
    confidence_buckets = []
    for range_name, counts in buckets.items():
        b_total = counts["bullish_total"]
        b_correct = counts["bullish_correct"]
        b_pct = round(b_correct / b_total * 100, 1) if b_total > 0 else None

        be_total = counts["bearish_total"]
        be_correct = counts["bearish_correct"]
        be_pct = round(be_correct / be_total * 100, 1) if be_total > 0 else None

        confidence_buckets.append(ConfidenceBucket(
            range=range_name,
            bullish_count=b_total,
            bullish_correct_pct=b_pct,
            bearish_count=be_total,
            bearish_correct_pct=be_pct,
        ))

    min_sample_size_met = total_evaluated >= 20

    return TrackRecordSummary(
        total_signals_logged=total_signals_logged,
        total_evaluated=total_evaluated,
        min_sample_size_met=min_sample_size_met,
        confidence_buckets=confidence_buckets,
        last_updated=int(time.time()),
    )
