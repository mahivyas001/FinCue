from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analysis import router as analysis_router
from routers.explain import router as explain_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FinCue API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(analysis_router)
app.include_router(explain_router)