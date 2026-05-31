# backend/core/config.py

from dotenv import load_dotenv
import os

_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
load_dotenv(dotenv_path=_env_path, override=True)

class Settings:
    AV_API_KEY:        str  = os.getenv("AV_API_KEY", "")
    ANTHROPIC_API_KEY: str  = os.getenv("ANTHROPIC_API_KEY", "")
    CACHE_TTL_SECS:    int  = int(os.getenv("CACHE_TTL_SECS", "300"))
    PORT:              int  = int(os.getenv("PORT", "8000"))
    DEBUG:             bool = os.getenv("DEBUG", "true").lower() == "true"

settings = Settings()