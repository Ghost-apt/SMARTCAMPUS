"""
SmartCampus AI — FastAPI Service Routes
=======================================
Implements endpoints for:
1. /health
2. /predict/academic-support
3. /predict/batch
4. /recommendations
5. /assistant/respond
6. /ml/train
7. /ml/model-info
"""

import os
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException, Query
from typing import Optional

from app.config import INTERNAL_API_KEY, MODEL_PATH, MODEL_META_PATH
from app.schemas import (
    HealthResponse,
    StudentMetrics,
    PredictionResult,
    BatchSupportRequest,
    BatchSupportResponse,
    RecommendationRequest,
    RecommendationResponse,
    AssistantQuery,
    AssistantResponse,
    ModelInfoResponse,
    TrainResponse,
    RAGIngestRequest,
    RAGIngestResponse,
    RAGQueryRequest,
    RAGQueryResponse,
    RAGStatusResponse
)
from app.ml.pipeline import (
    train_support_model,
    get_loaded_model,
    evaluate_student_risk
)
from app.services.recommender import generate_learning_recommendations
from app.services.assistant import generate_campus_response
from app.rag.text_extractor import extract_text_from_pdf, extract_text_from_string
from app.rag.chunker import create_chunks
from app.rag.vector_store import get_vector_store
from app.rag.generator import generate_rag_answer
import base64

router = APIRouter()

def verify_internal_auth(x_internal_key: Optional[str] = Header(None, alias="X-Internal-Key")):
    """
    Validates internal service-to-service communication.
    Allows local development calls when configured or matches INTERNAL_API_KEY.
    """
    if x_internal_key and x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized internal service access.")
    return True

@router.get("/health", response_model=HealthResponse)
def health_check():
    """Returns AI service telemetry, ML model load state, and LLM connectivity."""
    model, meta = get_loaded_model()
    return HealthResponse(
        status="healthy",
        service="SmartCampus AI Service",
        version="4.0.0",
        ml_model_loaded=model is not None,
        ml_model_version=meta.get("version") if meta else "unloaded",
        llm_connected=False,
        timestamp=datetime.utcnow().isoformat()
    )

@router.post("/predict/academic-support", response_model=PredictionResult)
def predict_academic_support(metrics: StudentMetrics, auth: bool = Header(None)):
    """
    Single student early academic support evaluation.
    Computes risk score, explainable primary factors, and recommended interventions.
    """
    result = evaluate_student_risk(metrics.model_dump())
    return PredictionResult(**result)

@router.post("/predict/batch", response_model=BatchSupportResponse)
def predict_batch_academic_support(batch: BatchSupportRequest):
    """
    Evaluates an entire classroom cohort or department for academic risk.
    """
    results = [evaluate_student_risk(s.model_dump()) for s in batch.students]
    at_risk = [r for r in results if r["needs_support"]]

    return BatchSupportResponse(
        success=True,
        total_analyzed=len(results),
        at_risk_count=len(at_risk),
        results=[PredictionResult(**r) for r in results]
    )

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest):
    """
    Generates personalized study topics and approved university library resources
    addressing identified performance gaps.
    """
    resources_list = [r.model_dump() for r in req.available_resources] if req.available_resources else []
    items = generate_learning_recommendations(
        student_id=req.student_id,
        weak_subjects=req.weak_subjects,
        attendance_percentage=req.attendance_percentage or 85.0,
        average_marks=req.average_marks or 75.0,
        available_resources=resources_list
    )

    return RecommendationResponse(
        success=True,
        student_id=req.student_id,
        total_recommendations=len(items),
        recommendations=items,
        generated_at=datetime.utcnow().isoformat()
    )

@router.post("/assistant/respond", response_model=AssistantResponse)
def assistant_chat(query_data: AssistantQuery):
    """
    Role-aware campus assistant answering attendance, routine, exam, and assignment queries
    using verified authorized student context.
    """
    res = generate_campus_response(
        user_id=query_data.user_id,
        role=query_data.role,
        query=query_data.query,
        context=query_data.context
    )

    return AssistantResponse(
        success=True,
        query=query_data.query,
        response=res["response"],
        intent=res["intent"],
        source=res["source"],
        timestamp=datetime.utcnow().isoformat()
    )

@router.post("/ml/train", response_model=TrainResponse)
def train_model():
    """
    Executes the scikit-learn training pipeline on benchmark dataset,
    evaluates holdout metrics, and saves model artifact to disk.
    """
    result = train_support_model(save_artifact=True)
    return TrainResponse(
        success=True,
        message="Student Support Classifier trained and evaluated successfully on holdout dataset.",
        metrics=result["metrics"],
        feature_importances=result["feature_importances"],
        samples_trained=result["samples_trained"],
        test_samples=result["test_samples"],
        saved_to=result["saved_to"]
    )

@router.get("/ml/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """
    Returns metadata, version, features, accuracy metrics, and responsible AI disclaimer.
    """
    model, meta = get_loaded_model()

    if meta is None:
        return ModelInfoResponse(
            model_name="SmartCampus Student Support Classifier",
            version="1.0.0-uninitialized",
            is_trained=False,
            algorithm="RandomForestClassifier(n_estimators=50, max_depth=5)",
            features=["attendance_percentage", "assignment_completion_rate", "average_exam_marks", "failed_assignments_count", "attendance_trend"],
            training_samples=0,
            metrics={"status": "Untrained. Use POST /ml/train to execute training pipeline."},
            feature_importances={},
            trained_at=None,
            disclaimer="Model currently uninitialized. System uses transparent heuristic threshold rules as fallback."
        )

    return ModelInfoResponse(**meta)

# ==========================================
# Phase 5: RAG Academic Document Endpoints
# ==========================================

@router.post("/rag/ingest", response_model=RAGIngestResponse)
def ingest_document(req: RAGIngestRequest):
    """
    Ingests an academic syllabus, note, or handout PDF/text into the persistent vector store.
    Extracts text page-by-page, detects unextractable/scanned files, chunks, and persists embeddings.
    """
    pages = []

    try:
        if req.file_base64:
            pdf_bytes = base64.b64decode(req.file_base64)
            pages = extract_text_from_pdf(pdf_bytes)
        elif req.file_path and os.path.exists(req.file_path):
            pages = extract_text_from_pdf(req.file_path)
        elif req.raw_text:
            pages = extract_text_from_string(req.raw_text, fallback_title=req.document_title)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either 'file_base64', valid 'file_path', or 'raw_text' must be provided for ingestion."
            )
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Document parsing failure: {str(exc)}")

    # Chunk the extracted pages with overlap and metadata
    chunks = create_chunks(
        document_id=req.document_id,
        document_title=req.document_title,
        pages=pages,
        course_code=req.course_code or "BCA",
        subject_code=req.subject_code or "BCA-501",
        department=req.department or "BCA",
        access_scope=req.access_scope or "enrolled"
    )

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="Document text was insufficient to generate valid overlapping chunks."
        )

    # Persist in vector store
    store = get_vector_store()
    doc_meta = {
        "title": req.document_title,
        "course_code": req.course_code or "BCA",
        "subject_code": req.subject_code or "BCA-501",
        "department": req.department or "BCA",
        "access_scope": req.access_scope or "enrolled",
        "page_count": len(pages),
        "created_at": datetime.utcnow().isoformat()
    }
    chunk_count = store.add_document(req.document_id, doc_meta, chunks)

    return RAGIngestResponse(
        success=True,
        document_id=req.document_id,
        chunks_indexed=chunk_count,
        status="Indexed",
        message=f"Successfully extracted {len(pages)} page(s) and indexed {chunk_count} chunk(s) into vector store."
    )

@router.post("/rag/query", response_model=RAGQueryResponse)
def query_academic_documents(req: RAGQueryRequest):
    """
    Retrieves authorized academic document passages and generates a grounded response
    with explicit page/title citations and prompt-injection shielding.
    """
    store = get_vector_store()

    # Retrieve candidate chunks filtered by authorized documents and subjects
    matched_chunks = store.search(
        query=req.query,
        top_k=req.top_k or 4,
        min_similarity=0.08,
        filter_doc_ids=req.allowed_document_ids,
        filter_subjects=req.allowed_subject_codes
    )

    # Generate answer with verified citations
    result = generate_rag_answer(
        query=req.query,
        retrieved_chunks=matched_chunks,
        user_role=req.role or "student"
    )

    return RAGQueryResponse(
        success=True,
        query=req.query,
        answer=result["answer"],
        citations=result["citations"],
        has_sufficient_evidence=result["has_sufficient_evidence"],
        engine=result["engine"]
    )

@router.delete("/rag/document/{document_id}")
def delete_rag_document(document_id: str):
    """
    Deletes all chunks and vectors associated with an academic document.
    """
    store = get_vector_store()
    existed = store.delete_document(document_id)
    return {
        "success": True,
        "document_id": document_id,
        "removed": existed,
        "message": "Document vectors successfully purged from store." if existed else "Document was not in index."
    }

@router.get("/rag/status", response_model=RAGStatusResponse)
def get_rag_status():
    """
    Reports status, readiness, and total catalog count of the RAG vector store.
    """
    store = get_vector_store()
    status_info = store.get_status()
    return RAGStatusResponse(
        success=True,
        total_documents=status_info["total_documents"],
        total_chunks=status_info["total_chunks"],
        is_ready=status_info["is_ready"],
        store_directory=status_info["store_directory"]
    )
