# SmartCampus AI — Python Microservice (Phases 4 & 5: AI, ML, & RAG Integration)

FastAPI microservice providing machine learning predictions, explainable early-support classification, personalized curriculum recommendations, role-aware AI campus advisory, and a **genuine RAG-powered Academic Document Assistant** for the SmartCampus AI university management platform.

---

## 1. Capabilities & Core Modules

### Feature 1: Student Academic Performance Analysis
- Gathers live academic records from MongoDB: lecture attendance compliance %, assignment submission status, failed assignment counts, and semester examination marks.
- Computes trend metrics and aggregates per-subject scores.

### Feature 2: ML Early-Support Classifier (`RandomForestClassifier`)
- **Pipeline**: Scikit-learn `Pipeline([('scaler', StandardScaler()), ('classifier', RandomForestClassifier(n_estimators=100, max_depth=6))])`.
- **Feature Vector**:
  1. `attendance_percentage`
  2. `assignment_completion_rate`
  3. `average_exam_marks`
  4. `failed_assignments_count`
  5. `attendance_trend`
- **Trained Artifacts**:
  - `ai-service/app/ml/support_model.joblib`
  - `ai-service/app/ml/support_model_meta.json`
- **Evaluation Benchmark** (600 isolated synthetic student records, 80/20 train/test split):
  - Accuracy: **96.67%**
  - Precision: **90.32%**
  - Recall: **96.55%**
  - F1-Score: **93.33%**
  - ROC-AUC: **0.9629**
- **Explainability**: Computes per-student feature deviation scores against cohort medians, identifies primary risk influencers, and outputs tailored faculty/student interventions.

### Feature 3: Personalized Learning Recommendations
- Identifies weak subjects (<75% attendance or <65% average marks).
- Maps gaps directly to approved university syllabus modules (`BCA-501` AI/ML, `BCA-502` Full-Stack Web, `BCA-503` DBMS, `BCA-504` Cloud/DevOps).
- Matches available library resources, recommended textbooks, and practical coding exercises with urgency prioritization (`High`, `Medium`, `Standard`).

### Feature 4: Role-Aware AI Campus Assistant
- Role-isolated conversational advisory with strict data boundaries.
- Live authorized context injection: student timetable, open assignments, attendance compliance %, exam grades, and fee balances.
- Hybrid generation: Queries local Ollama instance (`mistral` / `llama3`) if accessible; seamlessly falls back to deterministic context synthesis so the system is always responsive.

### Feature 5: RAG-Powered Academic Document Assistant (Phase 5)
- **Text & PDF Extraction (`pypdf`)**: Extracts text page-by-page preserving accurate 1-indexed `page_number` metadata.
- **Scanned PDF Rejection**: Detects empty or scanned PDFs with <30 extracted characters and raises clean rejection errors rather than hallucinating OCR.
- **Overlapping Semantic Chunker**: Splits text into chunks (`chunk_size=450` chars, `chunk_overlap=80` chars) preserving `chunk_id`, `document_id`, `page_number`, `course_code`, and `subject_code`.
- **Persistent Vector Store (`scikit-learn` TF-IDF + Cosine Vector Space)**:
  - Vector models and chunk registries persisted on disk in `app/rag/store/` (`metadata.json` & `vector_model.joblib`).
  - Strict server-side RBAC access filters (`allowed_document_ids`, `allowed_subject_codes`) applied BEFORE similarity ranking to eliminate citation leakage across departments.
  - Idempotent re-indexing and document purging support.
- **Prompt Injection Defense & Grounded Generation**:
  - Documents placed inside boundary markers (`=== BEGIN UNTRUSTED REFERENCE PASSAGES ===`).
  - Strict instruction telling LLM to never follow instructions within reference texts.
  - Honest insufficiency policy: returns clear "I cannot find sufficient information in the authorized documents" with 0 fabricated citations if similarity falls below threshold.
  - Extractive fallback synthesizer when local LLM is offline.

---

## 2. API Endpoints

All internal AI endpoints validate the shared secret key in `X-Internal-Key`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check, ML status & RAG vector store stats |
| `POST` | `/predict/academic-support` | Single student ML risk prediction & factor explainability |
| `POST` | `/predict/batch` | Cohort-level batch risk classification for faculty/admin |
| `POST` | `/recommendations` | Curriculum focus & library resource recommendations |
| `POST` | `/assistant/respond` | Role-aware conversational campus assistant |
| `POST` | `/ml/train` | Retrain classifier on benchmark dataset |
| `GET` | `/ml/model-info` | Current model metadata, features, and metrics |
| `POST` | `/rag/ingest` | Ingest PDF or plain text into RAG vector store |
| `POST` | `/rag/query` | Grounded semantic search with RBAC filters & citations |
| `DELETE`| `/rag/document/{id}` | Purge document chunks and update vector store index |
| `GET` | `/rag/status` | Vector store document count, chunk count, and index timestamp |

---

## 3. Local Setup & Execution (Windows PowerShell)

```powershell
# 1. Navigate to ai-service directory
cd "C:\VS CODE\SMARTCAMPUS\ai-service"

# 2. Activate Python virtual environment
.\venv\Scripts\Activate.ps1

# 3. Train or retrain the ML model (standalone CLI)
python -m app.ml.train

# 4. Start the FastAPI microservice
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## 4. Running Microservice Tests

```powershell
# Run pytest verification suite (12/12 tests passing)
.\venv\Scripts\pytest -v
```
