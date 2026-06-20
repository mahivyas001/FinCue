# backend/main.py

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analysis
from routers import explain          # ← add this
from routers import track_record
from routers import quote            # ← new quote router
from core.config import settings
from services.signal_log import init_db

init_db()

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="FinCue Backend",
    version="0.1.0",
    description="Technical analysis engine for FinCue. AI explains — backend calculates.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router)
app.include_router(explain.router)   # ← add this
app.include_router(track_record.router)
app.include_router(quote.router)     # ← /api/v1/quote/{symbol}

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}