"""
SmartCampus AI — FastAPI Service Application Entrypoint
======================================================
Provides AI & ML services for SmartCampus AI university management platform:
1. Academic Performance Analysis & Early Support Detection
2. Machine Learning Early-Support Classification (scikit-learn RandomForest)
3. Personalized Learning Curriculum & Resource Recommendations
4. Role-Aware AI Campus Assistant
"""

import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure app package is importable
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.config import HOST, PORT, ENV
from app.api.routes import router as api_router
from app.ml.pipeline import get_loaded_model, train_support_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Check and auto-initialize ML model if not already on disk
    model, meta = get_loaded_model()
    if model is None:
        print("[ML] Initializing SmartCampus Early-Support ML model pipeline...")
        try:
            train_support_model(save_artifact=True)
            print("[OK] Early-Support ML model trained and ready.")
        except Exception as e:
            print(f"[WARN] Startup ML training deferred: {e}. Heuristic fallback active.")
    else:
        print(f"[OK] Loaded existing ML model artifact: {meta.get('model_name')} (v{meta.get('version')})")
    yield
    print("[STOP] Shutting down SmartCampus AI Service.")

app = FastAPI(
    title="SmartCampus AI Microservice",
    description="Intelligent University Management, Student Support & ML Analytics API",
    version="4.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SmartCampus AI Microservice",
        "version": "4.0.0",
        "phase": "Phase 4 — AI & Machine Learning Integration Complete",
        "endpoints": [
            "/health",
            "/predict/academic-support",
            "/predict/batch",
            "/recommendations",
            "/assistant/respond",
            "/ml/train",
            "/ml/model-info"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=(ENV == "development"))
