# backend/core/config.py

from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    AV_API_KEY:     str = os.getenv("AV_API_KEY", "")
    CACHE_TTL_SECS: int = int(os.getenv("CACHE_TTL_SECS", "300"))   # 5 min default
    PORT:           int = int(os.getenv("PORT", "8000"))
    DEBUG:          bool = os.getenv("DEBUG", "true").lower() == "true"

settings = Settings()