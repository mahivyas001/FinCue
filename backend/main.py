# backend/main.py

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analysis
from core.config import settings

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
    allow_origins=["*"],    # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}