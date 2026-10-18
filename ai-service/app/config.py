import os

# Base directory for relative path resolution
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.dirname(BASE_DIR)
WORKSPACE_ROOT = os.path.dirname(SERVICE_ROOT)

def load_env_file(filepath: str) -> bool:
    """Safely loads key-value pairs from a .env file into os.environ if not already present."""
    if not os.path.isfile(filepath):
        return False
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and key not in os.environ:
                        os.environ[key] = val
        return True
    except Exception:
        return False

# Attempt to load from ai-service/.env first, then backend/.env, then root .env
load_env_file(os.path.join(SERVICE_ROOT, ".env"))
load_env_file(os.path.join(WORKSPACE_ROOT, "backend", ".env"))
load_env_file(os.path.join(WORKSPACE_ROOT, ".env"))

# Server Configuration
HOST = os.getenv("HOST", os.getenv("AI_SERVICE_HOST", "127.0.0.1"))
PORT = int(os.getenv("PORT", os.getenv("AI_SERVICE_PORT", 8000)))
ENV = os.getenv("ENV", os.getenv("NODE_ENV", "development")).lower()

# Internal Service-to-Service Secret Authentication
# Canonical variable: INTERNAL_AI_KEY (accepts INTERNAL_API_KEY for backwards compatibility)
KNOWN_DEV_SECRETS = {
    "smartcampus-internal-ai-secret-key-2026",
    "smartcampus_internal_ai_secret_key_2026",
    "your_shared_internal_ai_secret_key_here"
}

_raw_key = os.getenv("INTERNAL_AI_KEY", os.getenv("INTERNAL_API_KEY", "")).strip()

if ENV == "production":
    if not _raw_key or _raw_key in KNOWN_DEV_SECRETS or len(_raw_key) < 16:
        raise RuntimeError(
            "FATAL: Production mode requires an explicit, strong INTERNAL_AI_KEY environment variable. "
            "Default development placeholders are strictly rejected."
        )
    INTERNAL_API_KEY = _raw_key
else:
    INTERNAL_API_KEY = _raw_key or "smartcampus-internal-ai-secret-key-2026"

# Machine Learning Paths
MODEL_DIR = os.path.join(BASE_DIR, "ml")
MODEL_PATH = os.path.join(MODEL_DIR, "support_model.joblib")
MODEL_META_PATH = os.path.join(MODEL_DIR, "support_model_meta.json")

# Vector Store Path
VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", os.path.join(BASE_DIR, "rag", "store"))

# Optional Local LLM (Ollama) Integration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")
USE_LOCAL_LLM = os.getenv("USE_LOCAL_LLM", "false").lower() in ("true", "1")

