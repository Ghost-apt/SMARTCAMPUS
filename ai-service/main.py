"""
SmartCampus AI — Microservice Root Wrapper
==========================================
Direct entry point for running the FastAPI microservice from the ai-service root directory:
    python main.py
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT
    uvicorn.run(app, host=HOST, port=PORT)
