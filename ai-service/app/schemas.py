from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    ml_model_loaded: bool
    ml_model_version: Optional[str] = None
    llm_connected: bool
    timestamp: str

class SubjectScore(BaseModel):
    subject_code: str
    subject_name: Optional[str] = ""
    attendance_rate: float
    assignment_rate: Optional[float] = 100.0
    exam_score: Optional[float] = 80.0

class StudentMetrics(BaseModel):
    student_id: str
    name: Optional[str] = "Student"
    department: Optional[str] = "BCA"
    semester: Optional[int] = 5
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="Overall lecture attendance %")
    assignment_completion_rate: float = Field(..., ge=0.0, le=100.0, description="Turned-in coursework %")
    average_exam_marks: float = Field(..., ge=0.0, le=100.0, description="Average percentage across midterms & internals")
    failed_assignments_count: int = Field(default=0, ge=0, description="Count of missed or zero-score assignments")
    attendance_trend: float = Field(default=0.0, description="Weekly attendance rate shift (e.g. -4.5 or +2.1)")
    subject_scores: Optional[List[SubjectScore]] = []

class PredictionResult(BaseModel):
    student_id: str
    name: Optional[str] = "Student"
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Probability score between 0.0 and 1.0")
    risk_level: str = Field(..., description="'Low', 'Medium', or 'High'")
    needs_support: bool = Field(..., description="True if student would benefit from academic intervention")
    confidence: float = Field(..., description="Confidence estimate of evaluation")
    primary_factors: List[str] = Field(default=[], description="Key indicators contributing to evaluation")
    recommended_interventions: List[str] = Field(default=[], description="Actionable supportive steps for faculty/student")
    evaluation_basis: str = Field(..., description="Method used: 'Trained ML Model (RandomForest)' or 'Rule-Based Transparent Heuristic'")

class BatchSupportRequest(BaseModel):
    students: List[StudentMetrics]

class BatchSupportResponse(BaseModel):
    success: bool
    total_analyzed: int
    at_risk_count: int
    results: List[PredictionResult]

class ResourceItem(BaseModel):
    id: Optional[str] = None
    title: str
    subject_code: Optional[str] = None
    category: Optional[str] = "Lecture Notes"
    file_url: Optional[str] = None

class RecommendationRequest(BaseModel):
    student_id: str
    weak_subjects: Optional[List[str]] = []
    attendance_percentage: Optional[float] = 85.0
    average_marks: Optional[float] = 75.0
    available_resources: Optional[List[ResourceItem]] = []

class RecommendationItem(BaseModel):
    subject_code: str
    subject_name: str
    recommended_topic: str
    reason: str
    priority: str = Field(..., description="'High', 'Medium', 'Standard'")
    resource_title: Optional[str] = None
    resource_url: Optional[str] = None
    action_type: str = Field(default="Review Resource", description="'Review Resource', 'Practice Problems', 'Office Hours'")

class RecommendationResponse(BaseModel):
    success: bool
    student_id: str
    total_recommendations: int
    recommendations: List[RecommendationItem]
    generated_at: str

class AssistantQuery(BaseModel):
    user_id: str
    role: str = Field(..., description="'student', 'faculty', 'admin'")
    query: str
    context: Optional[Dict[str, Any]] = Field(default={}, description="Live authorized campus data supplied by Node.js backend")

class AssistantResponse(BaseModel):
    success: bool
    query: str
    response: str
    intent: str
    source: str
    timestamp: str

class ModelInfoResponse(BaseModel):
    model_name: str
    version: str
    is_trained: bool
    algorithm: str
    features: List[str]
    training_samples: int
    metrics: Dict[str, Any]
    feature_importances: Dict[str, float]
    trained_at: Optional[str] = None
    disclaimer: str

class TrainResponse(BaseModel):
    success: bool
    message: str
    metrics: Dict[str, Any]
    feature_importances: Dict[str, float]
    samples_trained: int
    test_samples: int
    saved_to: str

# ==========================================
# Phase 5: RAG Request & Response Schemas
# ==========================================
class RAGIngestRequest(BaseModel):
    document_id: str
    document_title: str
    course_code: Optional[str] = "BCA"
    subject_code: Optional[str] = "BCA-501"
    department: Optional[str] = "BCA"
    access_scope: Optional[str] = "enrolled"
    raw_text: Optional[str] = None
    file_path: Optional[str] = None
    file_base64: Optional[str] = None

class RAGIngestResponse(BaseModel):
    success: bool
    document_id: str
    chunks_indexed: int
    status: str
    message: str

class CitationItem(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    course_code: str
    subject_code: str
    excerpt: str
    relevance_score: float

class RAGQueryRequest(BaseModel):
    query: str
    role: Optional[str] = "student"
    allowed_document_ids: Optional[List[str]] = None
    allowed_subject_codes: Optional[List[str]] = None
    top_k: Optional[int] = 4

class RAGQueryResponse(BaseModel):
    success: bool
    query: str
    answer: str
    citations: List[CitationItem]
    has_sufficient_evidence: bool
    engine: str

class RAGStatusResponse(BaseModel):
    success: bool
    total_documents: int
    total_chunks: int
    is_ready: bool
    store_directory: str
