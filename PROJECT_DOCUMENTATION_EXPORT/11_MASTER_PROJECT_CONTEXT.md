# SmartCampus AI — Master Technical Context & AI Pair-Programming Manual

**Document ID:** `11_MASTER_PROJECT_CONTEXT`  
**Version:** 6.0.0  
**Generated Date:** 2026-10-28  
**Repository Working Directory:** `/Users/anurag93/Downloads/CodingZone/MajorProjects/SMARTCAMPUS`  
**Classification:** Consolidated Master Technical Blueprint for Developers & AI Coding Agents  

---

## ⚠️ MANDATORY DIRECTIVES FOR FUTURE AI CODING ASSISTANTS

> **READ THIS BEFORE MODIFYING ANY CODE IN THIS REPOSITORY:**
> 1. **PRESERVE EXISTING FUNCTIONALITY:** Do not delete, rename, or rewrite existing controllers, routes, models, or React components.
> 2. **NO STATIC MOCK DATA:** Do not replace real Mongoose database queries or API calls with hardcoded mock arrays.
> 3. **DUAL THEME MANDATE:** Both dark mode (`dark` class, midnight navy palette `#07162E`, `#0B132B`) and light mode (`#F8F6F0`) are fully functional and must remain intact.
> 4. **SAFE STARTUP ONLY:** Never run infinite server loops (`nodemon`, `vite`, `uvicorn`) synchronously in automated tool executions without backgrounding; use `npm start` or the provided scripts.
> 5. **SECRETS HYGIENE:** Never commit real secrets, private keys, or passwords. Use placeholder environment variables.

---

## 1. System Identity, Abstract & Tech Stack

**SmartCampus AI** is an intelligent university campus management, ERP, and student support platform. It serves three primary user personas: **Students**, **Faculty**, and **Administrators**.

### Exact Technology Stack (Source-Derived from Manifests)
* **Frontend:** React 18.3.1, Vite 5.4.6, React Router DOM 6.26.2, Tailwind CSS 3.4.11, Lucide React 0.441.0, Recharts 3.10.1, Axios 1.7.7.
* **Backend:** Node.js v20+, Express 5.3.0, Mongoose 9.11.2, Helmet 8.3.0, CORS 2.8.6, Express Rate Limit 8.7.1, Multer 2.4.0, Node-Cron 4.6.0, QRCode 1.5.4, Bcryptjs 3.0.3, Jsonwebtoken 9.0.3.
* **Database:** MongoDB 7.0 Community Engine (singleton Mongoose pool).
* **AI & Machine Learning:** Python 3.11, FastAPI >=0.100, Uvicorn >=0.23, Pydantic >=2.0, Scikit-Learn >=1.3, NumPy >=1.24, Pandas >=2.0, PyPDF >=3.17, Pytest >=7.4.
* **Containerization & CI:** Docker Compose (4 services: `mongodb`, `ai-service`, `backend`, `frontend`), GitHub Actions CI matrix (`.github/workflows/ci.yml`).

---

## 2. Directory Structure & Key Files

```
SMARTCAMPUS/
├── backend/
│   ├── config/database.js          # Mongoose connection pool & status telemetry
│   ├── config/envValidator.js      # Startup secret validation & Atlas URI self-healing
│   ├── controllers/                # 20 Express controllers (auth, fees, qr, ai, etc.)
│   ├── middleware/                 # authenticate.js, authorize.js, uploadMiddleware.js
│   ├── models/                     # 21 Mongoose models + CampusModels.js aggregator
│   ├── routes/                     # 19 Route files (130+ REST endpoints)
│   ├── services/                   # aiService.js, ragService.js, paymentService.js
│   ├── tests/                      # api.test.js, feeManagement.test.js, payment.test.js
│   └── server.js                   # Application entrypoint & HTTP server
├── client/
│   ├── src/
│   │   ├── components/             # Sidebar, Navbar, DashboardLayout, StatCard, etc.
│   │   ├── context/                # AuthContext.jsx, ThemeContext.jsx
│   │   ├── pages/                  # 31 Role-specific pages (Student, Faculty, Admin)
│   │   ├── services/api.js         # Axios client with interceptors
│   │   ├── App.jsx                 # Central React Router route definitions
│   │   └── main.jsx                # DOM mounting & Context provider wrapping
│   ├── vite.config.js              # Vite server, HTTPS SAN certs & proxy rules
│   └── tailwind.config.js          # Custom midnight dark palette tokens
├── ai-service/
│   ├── app/
│   │   ├── api/routes.py           # FastAPI routes with X-Internal-Key auth
│   │   ├── ml/pipeline.py          # RandomForest Early-Support classifier
│   │   ├── rag/vector_store.py     # Persistent TF-IDF vector store
│   │   ├── rag/text_extractor.py   # PyPDF page-by-page text parser
│   │   ├── rag/chunker.py          # Overlapping text chunker (500ch / 100ov)
│   │   ├── rag/generator.py        # Grounded answer synthesis & verified citations
│   │   └── schemas.py              # Pydantic v2 data models
│   ├── tests/                      # test_ml_pipeline.py, test_rag_pipeline.py
│   └── requirements.txt            # Pinned Python package dependencies
├── scripts/
│   ├── start-all.js                # Concurrent multi-process launcher
│   ├── stop-all.js                 # Coordinated port terminator (5000, 5173, 8000)
│   ├── verify-live-e2e.js          # Live integration validation script
│   └── test-profile-picture.js     # Avatar upload & magic-byte verifier
├── docker-compose.yml              # Production container orchestration
└── package.json                    # Root script runner
```

---

## 3. Frontend Route Registry (`client/src/App.jsx`)

* **Public Marketing & Auth:**
  * `/` $\rightarrow$ `<LandingPage />`
  * `/portal` $\rightarrow$ `<RootRedirect />` (redirects by role to `/student/dashboard`, `/faculty/dashboard`, or `/admin/dashboard`)
  * `/login` $\rightarrow$ `<LoginPage />`
  * `/register` $\rightarrow$ `<RegisterPage />`
  * `/unauthorized` $\rightarrow$ `<UnauthorizedPage />`
  * `*` $\rightarrow$ `<NotFoundPage />`
* **Student Protected Routes (Roles: `['student', 'admin']`):**
  * `/student/dashboard` $\rightarrow$ `<StudentDashboard />`
  * `/student/courses` $\rightarrow$ `<StudentCoursesPage />`
  * `/student/attendance` $\rightarrow$ `<StudentAttendancePage />`
  * `/student/timetable` $\rightarrow$ `<StudentTimetablePage />`
  * `/student/assignments` $\rightarrow$ `<StudentAssignmentsPage />`
  * `/student/results` $\rightarrow$ `<StudentResultsPage />`
  * `/student/fees` $\rightarrow$ `<StudentFeesPage />`
  * `/student/resources` $\rightarrow$ `<StudentResourcesPage />`
  * `/student/ai-assistant` $\rightarrow$ `<StudentAIPage />`
  * `/student/notices` $\rightarrow$ `<StudentNoticesPage />`
* **Faculty Protected Routes (Roles: `['faculty', 'admin']`):**
  * `/faculty/dashboard` $\rightarrow$ `<FacultyDashboard />`
  * `/faculty/classes` $\rightarrow$ `<FacultyClassesPage />`
  * `/faculty/courses` $\rightarrow$ `<FacultyClassesPage />`
  * `/faculty/attendance` $\rightarrow$ `<FacultyAttendancePage />`
  * `/faculty/assignments` $\rightarrow$ `<FacultyAssignmentsPage />`
  * `/faculty/performance` $\rightarrow$ `<FacultyPerformancePage />`
  * `/faculty/materials` $\rightarrow$ `<FacultyMaterialsPage />`
  * `/faculty/notices` $\rightarrow$ `<FacultyNoticesPage />`
* **Admin Protected Routes (Roles: `['admin']`):**
  * `/admin/dashboard` $\rightarrow$ `<AdminDashboard />`
  * `/admin/registrations` $\rightarrow$ `<AdminRegistrationsPage />`
  * `/admin/students` $\rightarrow$ `<AdminStudentsPage />`
  * `/admin/faculty` $\rightarrow$ `<AdminFacultyPage />`
  * `/admin/departments` $\rightarrow$ `<AdminDepartmentsPage />`
  * `/admin/courses` $\rightarrow$ `<AdminCoursesPage />`
  * `/admin/timetable` $\rightarrow$ `<AdminTimetablePage />`
  * `/admin/attendance` $\rightarrow$ `<AdminAttendancePage />`
  * `/admin/fees` $\rightarrow$ `<AdminFeesPage />`
  * `/admin/notices` $\rightarrow$ `<AdminNoticesPage />`
  * `/admin/analytics` $\rightarrow$ `<AdminAnalyticsPage />`
  * `/admin/settings` $\rightarrow$ `<AdminSettingsPage />`
* **Universal Protected Profile:**
  * `/profile` $\rightarrow$ `<ProfilePage />` (Roles: `['student', 'faculty', 'admin']`)

---

## 4. Backend REST API Architecture & Key Endpoints

Mounted in `backend/server.js`:
* `/api/health`, `/api/health/live`, `/api/health/ready`: System telemetry and Kubernetes/Docker probes.
* `/api/auth`: Authentication (`/register`, `/login`, `/logout`, `/me`, `/registration-status`).
* `/api/admin/registration-requests`: Public registration governance (`/`, `/:id/approve`, `/:id/reject`).
* `/api/users`: Profile details, password updates, and avatar uploads (`/me`, `/me/profile-picture`).
* `/api/students`, `/api/faculty`, `/api/departments`: Campus directory management.
* `/api/courses`, `/api/subjects`: Academic degree programs and syllabus modules.
* `/api/attendance`: Manual roll-call and dynamic rotating QR session generation (`/qr/create-session`, `/qr/scan`).
* `/api/timetable`: Weekly routine scheduling with clash detection (`/`, `/today`).
* `/api/assignments`: Coursework authoring, student file submissions, and grading.
* `/api/examinations`, `/api/results`: Exam scheduling, marks entry, and GPA calculation.
* `/api/fees`: Dynamic fee structure design, Razorpay checkout orders (`/order`, `/verify`), offline cash payment recording (`/offline-pay`).
* `/api/notices`: Bulletin announcements with priority and audience filters.
* `/api/resources`: Study materials upload with automated AI RAG indexing (`/`, `/:id/reindex`).
* `/api/dashboard`: Aggregated dashboard telemetry for Student, Faculty, and Admin.
* `/api/analytics`: Institutional analytics and security audit trails (`/admin/overview`, `/admin/audit-logs`).
* `/api/notifications`: In-app user notifications (`/`, `/unread-count`, `/:id/read`).
* `/api/ai`: AI Assistant chat, Random Forest early risk analysis, RAG document queries (`/chat`, `/document-assistant/query`, `/recommendations`, `/early-support`).

---

## 5. Mongoose Domain Models Summary (21 Entities)

Aggregated in `backend/models/CampusModels.js`:
1. `User`: Identity, email, bcrypt password hash (`select: false`), role (`student`, `faculty`, `admin`), department, avatar.
2. `RegistrationRequest`: Public registration applications pending admin review.
3. `Department`: Academic divisions (e.g. BCA, CSE, MBA) with designated head of department.
4. `Course`: Degree programs with semester duration and credit point requirements.
5. `Subject`: Academic curriculum modules with credit weights and assigned faculty.
6. `StudentProfile`: Roll number, semester, batch, academic status, guardian info, CGPA.
7. `FacultyProfile`: Employee ID, academic designation, qualifications, office hours.
8. `Attendance`: Individual student roll-call records with verification method (`Manual`, `QR_Dynamic`).
9. `AttendanceSession`: Short-lived classroom sessions holding dynamic QR tokens.
10. `TimetableEntry`: Class routine slots with room and timing definitions.
11. `Assignment`: Coursework assignments with nested submissions array.
12. `Examination`: Mid-term and terminal examination timetables.
13. `Result`: Graded scorecards and UGC 10-point GPA evaluations.
14. `FeeStructure`: Version-controlled academic fee blueprints.
15. `FeeRecord`: Student billing invoice ledger with pre-save balance calculation.
16. `PaymentTransaction`: Audit records of Razorpay online orders and offline cash remittances.
17. `Resource`: Uploaded lecture notes and syllabi with RAG indexing status.
18. `Notice`: Campus circulars with expiry dates.
19. `Notification`: Targeted in-app alerts with read/unread tracking.
20. `AuditLog`: Security audit trails recording administrative mutations with actor and IP.
21. `AIQueryLog`: Query telemetry logging AI assistant latency and token usage.

---

## 6. AI Microservice & RAG Mechanics

* **Service Auth:** Internal calls require `X-Internal-Key` matching `INTERNAL_AI_KEY` via constant-time comparison (`secrets.compare_digest`).
* **Machine Learning Pipeline (`ai-service/app/ml/pipeline.py`):**
  * Supervised model: `StandardScaler` + `RandomForestClassifier` (100 estimators).
  * Evaluates 5 academic features: attendance percentage, assignment completion rate, average exam marks, failed assignments count, and attendance trend.
  * Outputs risk score, explainable primary contributing factors, and human-in-the-loop intervention suggestions.
* **RAG Document Engine (`ai-service/app/rag/`):**
  * `text_extractor.py`: PyPDF extracts text page-by-page. Rejects unextractable/scanned PDFs (<40 chars).
  * `chunker.py`: Generates 500-character chunks with 100-character overlap, attaching document title, page number, and subject code.
  * `vector_store.py`: Builds persistent TF-IDF vector matrix stored in `app/rag/store/`. Evaluates query relevance via cosine similarity.
  * `generator.py`: Formats grounded response, injects verifiable page-level citations, strips prompt-injection triggers, and falls back to an insufficient-evidence disclaimer if content is missing.

---

## 7. Configuration & Environment Variables

| Variable | Target Subsystem | Mandatory? | Purpose |
|---|---|---|---|
| `PORT` | Backend / AI Service | Optional | Port binding (Backend: 5000, AI: 8000) |
| `NODE_ENV` | Backend | Recommended | `'development'`, `'test'`, `'production'` |
| `MONGODB_URI` | Backend | **Mandatory** | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Backend | **Mandatory** | Minimum 32-character high-entropy secret |
| `CLIENT_ORIGIN` | Backend | Production | Frontend origin for CORS whitelisting |
| `INTERNAL_AI_KEY` | Backend & AI Service | **Mandatory** | Shared secret for internal service communication |
| `AI_SERVICE_URL` | Backend | Optional | Address of AI service (default `http://localhost:8000`) |
| `RAZORPAY_KEY_ID` | Backend | Optional | Razorpay payment gateway key |
| `RAZORPAY_KEY_SECRET` | Backend | Optional | Razorpay signature verification secret |
| `OLLAMA_BASE_URL` | AI Service | Optional | Local Ollama LLM endpoint (`http://host.docker.internal:11434`) |

---

## 8. Verification & Test Commands

* **Run All Tests:** `npm test` (invokes backend tests, client contract tests, and pytest).
* **Backend Test Suite (47 tests):** `npm --prefix backend test`
* **Fee Management Suite (13 tests):** `node --test backend/tests/feeManagement.test.js`
* **Payment Lifecycle Suite (15 tests):** `node --test backend/tests/payment.test.js`
* **Registration Suite (10 tests):** `node --test backend/tests/registration.test.js`
* **AI Service Test Suite (12 tests):** `powershell -Command "cd ai-service; .\venv\Scripts\pytest -v"` (or `pytest ai-service/tests`)
* **Live Integration E2E:** `npm run test:live`
* **Avatar Upload E2E:** `npm run test:avatar`
* **Start Application:** `npm start` (spawns backend, client, and AI service)
* **Stop Application:** `npm run stop` (releases all listening ports)

---

## 9. Cross-References to Detailed Documentation

For exhaustive deep-dive analyses, refer to the accompanying export documents:
* [`01_PROJECT_OVERVIEW.md`](01_PROJECT_OVERVIEW.md): Executive summary & technology stack.
* [`02_COMPLETE_FILE_INVENTORY.md`](02_COMPLETE_FILE_INVENTORY.md): Full 182-file repository catalog.
* [`03_FRONTEND_DOCUMENTATION.md`](03_FRONTEND_DOCUMENTATION.md): React 18 / Vite / Tailwind UI component reference.
* [`04_BACKEND_API_DOCUMENTATION.md`](04_BACKEND_API_DOCUMENTATION.md): Complete 130+ REST endpoint reference.
* [`05_DATABASE_SCHEMA_AND_RELATIONSHIPS.md`](05_DATABASE_SCHEMA_AND_RELATIONSHIPS.md): 21 Mongoose models & Mermaid ER diagram.
* [`06_DATA_FLOW_AND_INTEGRATION_MAP.md`](06_DATA_FLOW_AND_INTEGRATION_MAP.md): Sequence diagrams & end-to-end traces.
* [`07_AI_ML_RAG_DOCUMENTATION.md`](07_AI_ML_RAG_DOCUMENTATION.md): Random Forest classifier & RAG vector store architecture.
* [`08_SECURITY_AND_CONFIGURATION.md`](08_SECURITY_AND_CONFIGURATION.md): Auth, RBAC, PKI SSL, headers & secret management.
* [`09_DEVOPS_DEPLOYMENT_AND_TESTING.md`](09_DEVOPS_DEPLOYMENT_AND_TESTING.md): Docker Compose, CI/CD & 65+ automated tests.
* [`10_PROJECT_STATUS_AND_REMAINING_WORK.md`](10_PROJECT_STATUS_AND_REMAINING_WORK.md): Six-phase audit matrix & future roadmap.
* [`12_AUDIT_INDEX_AND_EVIDENCE.md`](12_AUDIT_INDEX_AND_EVIDENCE.md): Finding IDs, code symbols & physical proof index.

