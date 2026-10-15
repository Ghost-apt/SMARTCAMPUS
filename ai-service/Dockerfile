# ==========================================
# Production Dockerfile for SmartCampus AI & RAG Microservice
# ==========================================

FROM python:3.11-slim

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications
COPY requirements.txt ./

# Install python dependencies without cache
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and pre-trained models
COPY app/ ./app/
COPY main.py ./

# Create non-root user for security hardening
RUN useradd -m -u 1001 appuser \
    && mkdir -p /app/app/rag/store \
    && chown -R appuser:appuser /app

USER appuser

# Expose microservice port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI application with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
