# SmartCampus AI — Python Microservice (Phase 2)

This directory hosts the Python/FastAPI microservice for SmartCampus AI.

## Planned Phase 2 Capabilities
1. **RAG-based Campus Knowledge Retrieval**:
   - Vector database (ChromaDB / FAISS) for university policies, syllabus documents, and FAQs.
   - Text embeddings and conversational memory.
2. **Student Performance Analytics**:
   - Machine learning algorithms to predict at-risk students based on attendance patterns and assignment scores.
   - Tailored learning path recommendations.

## Setup Instructions (Windows PowerShell)

```powershell
# 1. Navigate to ai-service directory
cd "C:\VS CODE\SMARTCAMPUS\ai-service"

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run FastAPI server
uvicorn main:app --reload --port 8000
```

