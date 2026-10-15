import os

# Server Configuration
HOST = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
ENV = os.getenv("ENV", "development")

# Internal Service-to-Service Secret Authentication
# Used to verify that calls to AI service originate from the authorized Node.js backend
INTERNAL_API_KEY = os.getenv("INTERNAL_AI_KEY", "smartcampus-internal-ai-secret-key-2026")

# Machine Learning Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ml")
MODEL_PATH = os.path.join(MODEL_DIR, "support_model.joblib")
MODEL_META_PATH = os.path.join(MODEL_DIR, "support_model_meta.json")

# Optional Local LLM (Ollama) Integration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
USE_LOCAL_LLM = os.getenv("USE_LOCAL_LLM", "false").lower() in ("true", "1")
