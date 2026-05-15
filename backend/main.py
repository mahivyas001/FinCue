# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analysis import router as analysis_router

app = FastAPI(
    title="FinCue Backend",
    description="Real signal computation for FinCue app",
    version="1.0.0",
)

# Allow React Native / Expo to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "fincue-backend"}