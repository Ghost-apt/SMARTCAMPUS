# SmartCampus AI — Audit Findings Index & Physical Evidence Reference

**Document ID:** `12_AUDIT_INDEX_AND_EVIDENCE`  
**Version:** 6.0.0  
**Generated Date:** 2026-10-28  
**Repository Working Directory:** `/Users/anurag93/Downloads/CodingZone/MajorProjects/SMARTCAMPUS`  
**Classification:** Evidence-Based Audit Catalog & Traceability Index  

---

## 1. Audit Scope & Verification Methodology

This document indexes all empirical findings, architectural characteristics, and security verifications discovered during the comprehensive inspection of the SmartCampus AI repository.

### Verification Classification Levels:
* **CONFIRMED (Evidence-Based):** Directly proven through static source code analysis, file system artifacts, schema definitions, or passing automated test executions.
* **INFERRED (High Confidence):** Deduced from architectural naming conventions, standard library implementations, or complementary component configurations.
* **REQUIRES RUNTIME VALIDATION:** Dependent on external infrastructure availability (e.g. active Razorpay merchant accounts, live Ollama GPU inference, or physical biometric hardware).

---

## 2. Master Findings & Verification Catalog

| Finding ID | Classification | Subsystem | Description & Current State | Physical Evidence Path & Symbol | Confidence Level | Related Document |
|---|---|---|---|---|---|---|
| **SC-E001** | Architecture | Root Stack | Decoupled 4-tier microservices architecture (React Vite SPA, Node.js Express Gateway, Python FastAPI AI, MongoDB 7.0). | `docker-compose.yml`, `package.json`, `server.js` | **CONFIRMED** | `01_PROJECT_OVERVIEW.md` |
| **SC-E002** | Security | Identity | Password hashing enforced using bcryptjs with 10 salt rounds and `select: false` on Mongoose schema. | `backend/models/User.js` (`pre('save')`, line 58) | **CONFIRMED** | `08_SECURITY_AND_CONFIGURATION.md` |
| **SC-E003** | Security | AI Service Auth | Internal service authentication uses constant-time string comparison (`secrets.compare_digest`) on `X-Internal-Key`. | `ai-service/app/api/routes.py` (`verify_internal_auth`) | **CONFIRMED** | `07_AI_ML_RAG_DOCUMENTATION.md` |
| **SC-E004** | Security | Production Secrets | Server startup halts in production if default/known development JWT secrets are detected. | `backend/config/envValidator.js` (`KNOWN_DEV_JWT_SECRETS`) | **CONFIRMED** | `08_SECURITY_AND_CONFIGURATION.md` |
| **SC-E005** | Security | Upload Security | File upload engine verifies magic bytes for JPEG, PNG, and PDF files, rejecting disguised executables. | `backend/middleware/uploadMiddleware.js` (lines 40-75) | **CONFIRMED** | `08_SECURITY_AND_CONFIGURATION.md` |
| **SC-E006** | Database | Ledger Balancing | Mongoose pre-save hook on `FeeRecord` automatically recomputes `balanceAmount` and updates status to `Paid` / `Partial` / `Overdue`. | `backend/models/FeeRecord.js` (`pre('save')`, line 65) | **CONFIRMED** | `05_DATABASE_SCHEMA_AND_RELATIONSHIPS.md` |
| **SC-E007** | Integration | Payment Idempotency | Payment transactions enforce unique constraint on `orderId` to prevent duplicate ledger credits. | `backend/models/PaymentTransaction.js` (`orderId: { unique: true }`) | **CONFIRMED** | `05_DATABASE_SCHEMA_AND_RELATIONSHIPS.md` |
| **SC-E008** | AI / ML | Risk Model | Random Forest supervised classifier with 5 standardized features trained and persisted to disk. | `ai-service/app/ml/pipeline.py` (`evaluate_student_risk`) | **CONFIRMED** | `07_AI_ML_RAG_DOCUMENTATION.md` |
| **SC-E009** | AI / RAG | Text Extraction | PyPDF extracts text page-by-page and rejects scanned or unextractable PDFs lacking a text layer (<40 chars). | `ai-service/app/rag/text_extractor.py` (lines 35-50) | **CONFIRMED** | `07_AI_ML_RAG_DOCUMENTATION.md` |
| **SC-E010** | AI / RAG | Vector Persistence | Persistent TF-IDF vector matrix and document metadata serialized to disk in `app/rag/store/`. | `ai-service/app/rag/vector_store.py` (`PersistentVectorStore`) | **CONFIRMED** | `07_AI_ML_RAG_DOCUMENTATION.md` |
| **SC-E011** | AI / RAG | Verifiable Citations | Answers generate explicit document title and physical page number citations without fabricating sources. | `ai-service/app/rag/generator.py` (`extract_citations`) | **CONFIRMED** | `07_AI_ML_RAG_DOCUMENTATION.md` |
| **SC-E012** | AI / RAG | Anti-Injection | Prompts and retrieved chunks pass through `sanitize_untrusted_text()`, stripping prompt-injection triggers. | `ai-service/app/rag/generator.py` (`sanitize_untrusted_text`) | **CONFIRMED** | `07_AI_ML_RAG_DOCUMENTATION.md` |
| **SC-E013** | Operations | QR Attendance | Dynamic classroom QR sessions utilize rotating cryptographic tokens with strict expiration windows. | `backend/controllers/qrAttendanceController.js`, `AttendanceSession.js` | **CONFIRMED** | `06_DATA_FLOW_AND_INTEGRATION_MAP.md` |
| **SC-E014** | Infrastructure | Local 2-Tier PKI | Development OpenSSL scripts generate Root CA and Leaf Server certificates with extensive SAN IP coverage. | `client/scripts/generate-cert.js`, `trust-cert.bat` | **CONFIRMED** | `08_SECURITY_AND_CONFIGURATION.md` |
| **SC-E015** | QA / CI | Test Suites | GitHub Actions workflow executes 65+ automated tests across Node.js 20/22 and Python 3.11 test matrices. | `.github/workflows/ci.yml`, `backend/tests/api.test.js` | **CONFIRMED** | `09_DEVOPS_DEPLOYMENT_AND_TESTING.md` |

---

## 3. Discovered Historical Items & Resolutions

During inspection of earlier reports and commit history, several prior observations were tracked to verify their current state in the repository:

1. **AI Microservice Authentication Enforcement:**
   * *Earlier Observation:* `verify_internal_auth` previously returned `True` when `x_internal_key` was omitted.
   * *Current Codebase State:* **RESOLVED & VERIFIED.** `ai-service/app/api/routes.py` explicitly rejects missing or whitespace keys with HTTP 401 and uses `secrets.compare_digest` with HTTP 403 on invalid keys. Every AI and RAG endpoint enforces `dependencies=[Depends(verify_internal_auth)]`.
2. **Timetable Parameter Dynamic Resolution:**
   * *Earlier Observation:* `StudentTimetablePage.jsx` was previously suspected of hardcoding query parameters to `?courseCode=BCA&semester=5`.
   * *Current Codebase State:* **RESOLVED & VERIFIED.** Lines 15-38 of `StudentTimetablePage.jsx` dynamically resolve student course and semester from `profile?.course || user?.department || 'BCA'` and `profile?.semester || 5`, with active change listeners synchronizing state if profile data loads asynchronously.
3. **Dedicated Admin Settings Navigation:**
   * *Earlier Observation:* `/admin/settings` previously routed to `<AdminAnalyticsPage />`.
   * *Current Codebase State:* **RESOLVED & VERIFIED.** `client/src/App.jsx` mounts the dedicated component `<AdminSettingsPage />` with system health telemetry, AI connection status, and security audit log viewers.

---

## 4. Uninspected & Excluded File Boundaries

In accordance with strict inspection rules, the following generated or third-party artifact directories were excluded from raw source documentation:
* `node_modules/` (Root, Backend, Client): Third-party vendor packages inspected via `package.json` manifests and `package-lock.json` lockfiles.
* `ai-service/venv/`: Isolated Python virtual environment inspected via `ai-service/requirements.txt`.
* `client/dist/`: Production build output generated by Vite.
* `backend/backups/`: Historical JSON database dump snapshots inspected via `backup-metadata.json`.
* `.git/`: Version control database inspected via `git log` and `git status`.

---

## 5. Claims Requiring Runtime Environment Validation

The following capabilities are implemented in source code but depend on external third-party infrastructure for live execution:
1. **Live Razorpay Payment Capture:** Requires valid production `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. In development and automated test modes, mock order generation and cryptographic HMAC verification are executed.
2. **Ollama Natural Language Synthesis:** Requires a running local Ollama instance on port 11434 with model `mistral` pulled. If offline, the RAG generator gracefully degrades to extractive document synthesis.
3. **Hardware WebCam Profile Picture Capture:** Requires a physical camera device supporting `navigator.mediaDevices.getUserMedia()`. In headless/automated test environments, file upload mode is utilized.

