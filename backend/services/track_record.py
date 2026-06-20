# backend/services/track_record.py

import sqlite3
import time
import logging
from services.signal_log import DB_PATH
from services.quote import fetch_current_quote

logger = logging.getLogger(__name__)

async def evaluate_pending_outcomes():
    """
    Finds signals where signaled_at is 14+ days in the past and outcome_evaluated_at is NULL.
    Fetches the current price, computes the percentage change, and saves it.
    Caps at 20 rows to avoid exhausting API rate limits.
    """
    now = int(time.time())
    fourteen_days_ago = now - 14 * 24 * 60 * 60

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get at most 20 pending rows (only Bullish or Bearish signals need outcome evaluation)
        cursor.execute("""
            SELECT id, symbol, price_at_signal, signaled_at
            FROM signal_logs
            WHERE signaled_at <= ? AND outcome_evaluated_at IS NULL AND signal_type IN ('Bullish', 'Bearish')
            LIMIT 20
        """, (fourteen_days_ago,))
        
        pending_rows = cursor.fetchall()
        conn.close()

        if not pending_rows:
            return

        logger.info(f"[Lazy Evaluation] Found {len(pending_rows)} pending outcomes to evaluate...")

        for row in pending_rows:
            row_id = row["id"]
            symbol = row["symbol"]
            price_at_signal = row["price_at_signal"]

            try:
                # Fetch current quote (async)
                quote = await fetch_current_quote(symbol)
                current_price = quote["price"]
                
                # Compute percentage change
                pct_change = (current_price - price_at_signal) / price_at_signal * 100
                
                # Update SQLite
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE signal_logs
                    SET outcome_price = ?,
                        outcome_pct_change = ?,
                        outcome_evaluated_at = ?
                    WHERE id = ?
                """, (current_price, pct_change, now, row_id))
                conn.commit()
                conn.close()
                logger.info(f"[Lazy Evaluation] Evaluated signal {row_id} for {symbol}: {price_at_signal} -> {current_price} ({pct_change:.2f}%)")
            except Exception as e:
                logger.error(f"[Lazy Evaluation] Failed to evaluate outcome for signal {row_id} ({symbol}): {e}")
                if "RATE_LIMIT" in str(e):
                    logger.warning("[Lazy Evaluation] Alpha Vantage rate limit reached. Stopping batch.")
                    break
    except Exception as e:
        logger.error(f"[Lazy Evaluation] Error during pending outcomes evaluation: {e}")
