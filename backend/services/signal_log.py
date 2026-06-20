# backend/services/signal_log.py

import sqlite3
import os
import time
import logging

logger = logging.getLogger(__name__)

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "signal_log.db")

def init_db():
    """Initializes the database directory and signal logs table on startup."""
    try:
        os.makedirs(DB_DIR, exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS signal_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                market TEXT NOT NULL,
                signal_type TEXT NOT NULL,
                confidence INTEGER NOT NULL,
                price_at_signal REAL NOT NULL,
                signaled_at INTEGER NOT NULL,
                outcome_price REAL,
                outcome_pct_change REAL,
                outcome_evaluated_at INTEGER
            )
        """)
        conn.commit()
        conn.close()
        logger.info(f"SQLite database initialized at {DB_PATH}")
    except Exception as e:
        logger.error(f"Failed to initialize SQLite database: {e}")

def infer_market(symbol: str) -> str:
    """Infers whether the stock is US or IN based on ticker suffix or name list."""
    indian_symbols = ["RELIANCE", "INFY", "TCS", "HDFCBANK", "WIPRO"]
    symbol_upper = symbol.upper()
    if any(ind in symbol_upper for ind in indian_symbols) or symbol_upper.endswith(".BSE") or symbol_upper.endswith(".NSE"):
        return "IN"
    return "US"

def log_signal(symbol: str, market: str, signal_type: str, confidence: int, price: float):
    """Appends a new signal record to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        now = int(time.time())
        cursor.execute("""
            INSERT INTO signal_logs 
            (symbol, market, signal_type, confidence, price_at_signal, signaled_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (symbol.upper(), market.upper(), signal_type.capitalize(), confidence, price, now))
        conn.commit()
        conn.close()
        logger.info(f"Logged signal to DB: {symbol} | {signal_type} | {confidence}% | Price: {price}")
    except Exception as e:
        logger.error(f"Failed to log signal for {symbol} to SQLite: {e}")
