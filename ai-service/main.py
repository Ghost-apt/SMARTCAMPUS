"""
SmartCampus AI — Academic & Student Support Microservice (Phase 2 Foundation)
=============================================================================
This microservice is reserved for Phase 2 AI/ML workloads, including:
1. RAG-based campus knowledge retrieval (Vector Store + Embeddings)
2. Intelligent Student Academic Advisory & Analytics
3. Academic performance prediction & automated recommendations
"""

from typing import Optional
from datetime import datetime

# Lightweight mock fallback if FastAPI / Uvicorn is not yet installed in Phase 1
try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel

    app = FastAPI(
        title="SmartCampus AI Microservice",
        description="Intelligent University Management & Student Support AI Backend",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class QueryRequest(BaseModel):
        query: str
        category: Optional[str] = "General"

    class QueryResponse(BaseModel):
        response: str
        category: str
        source: str
        timestamp: str

    @app.get("/")
    def root():
        return {
            "status": "online",
            "service": "SmartCampus AI Service",
            "phase": "Phase 2 Preparation",
            "endpoints": ["/health", "/api/chat"]
        }

    @app.get("/health")
    def health_check():
        return {
            "status": "healthy",
            "service": "SmartCampus AI Service",
            "timestamp": datetime.utcnow().isoformat(),
            "rag_engine": "Ready for Phase 2 initialization"
        }

    @app.post("/api/chat", response_model=QueryResponse)
    def chat_endpoint(request: QueryRequest):
        q = request.query.lower()

        # Rule-based intelligent responses for campus domains (Phase 1/2 bridge)
        if "attendance" in q:
            reply = "University Attendance Rule: A minimum 75% attendance is mandatory in all registered courses to be eligible for end-semester exams."
        elif "exam" in q or "timetable" in q:
            reply = "Examinations Schedule: End-semester examinations commence on the date notified by the Controller of Examinations. Hall tickets are available 7 days prior."
        elif "fee" in q or "scholarship" in q:
            reply = "Fees & Scholarships: Semester dues must be cleared online or through the university finance desk. Merit-cum-means scholarship applications are open until end of month."
        elif "project" in q or "bca" in q:
            reply = "BCA Final-Year Capstone: Students must submit the software requirements specification (SRS), system architecture diagrams, and prototype demo as per the academic calendar."
        else:
            reply = f"SmartCampus AI: I have received your inquiry ('{request.query}'). Comprehensive RAG vector retrieval will be active in Phase 2."

        return QueryResponse(
            response=reply,
            category=request.category,
            source="fastapi-knowledge-base",
            timestamp=datetime.utcnow().isoformat()
        )

except ImportError:
    # Fallback definition when running without fastapi installed
    app = None
    print("ℹ️ FastAPI/Pydantic not yet installed in local Python environment. Install via 'pip install -r requirements.txt'")

if __name__ == "__main__":
    import uvicorn
    if app:
        uvicorn.run(app, host="127.0.0.1", port=8000)
    else:
        print("Please install requirements first: pip install fastapi uvicorn pydantic")
