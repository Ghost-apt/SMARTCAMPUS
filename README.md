# SmartCampus AI — Intelligent University Management & Student Support System

> **BCA Final-Year Major Project**  
> **Workspace**: `C:\VS CODE\SMARTCAMPUS`  
> **Version**: 5.0.0 (Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 Complete)

SmartCampus AI is an enterprise-grade university management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and an integrated Python FastAPI machine learning & RAG microservice (`scikit-learn`, `RandomForestClassifier`, `TF-IDF + Cosine Vector Space`, `pypdf`). It provides comprehensive, role-based portals for **Students**, **Faculty**, and **Administrators** with real-time analytics, automated conflict-free timetable scheduling, attendance tracking with dynamic QR check-in, coursework submission and grading, examination results with UGC 10-point GPA calculation, fee ledger management, campus announcements, interactive notifications, background automation daemons, intelligent academic support (ML early-support classification, explainable risk factors, personalized curriculum recommendations, role-aware AI campus assistant), and a **genuine RAG-powered Academic Document Assistant** with verified citations and fail-closed RBAC document security.

---

## 1. Project Architecture & Structure

```
SMARTCAMPUS/
├── .gitignore
├── README.md
│
├── ai-service/                              # Python AI, ML & RAG Microservice
│   ├── main.py                              # FastAPI entrypoint (Port 8000)
│   ├── requirements.txt                     # FastAPI, scikit-learn, pypdf, pandas, numpy, pytest
│   ├── pytest.ini                           # Pytest configuration
│   ├── README.md                            # AI/ML & RAG documentation & specs
│   │
│   ├── app/
│   │   ├── config.py                        # Service configuration & shared internal key
│   │   ├── schemas.py                       # Pydantic validation schemas (ML & RAG)
│   │   │
│   │   ├── ml/
│   │   │   ├── pipeline.py                  # Scikit-learn StandardScaler + RandomForest pipeline
│   │   │   ├── synthetic_data.py            # Isolated 600-sample benchmark dataset generator
│   │   │   ├── train.py                     # Standalone training script (96.67% accuracy)
│   │   │   ├── support_model.joblib         # Serialized ML model artifact
│   │   │   └── support_model_meta.json      # Model performance metrics & feature importances
│   │   │
│   │   ├── rag/                             # Genuine RAG Academic Document Pipeline (Phase 5)
│   │   │   ├── text_extractor.py            # Page-by-page PDF & text extraction, scanned PDF check
│   │   │   ├── chunker.py                   # Overlapping semantic chunking (450 chars, 80 overlap)
│   │   │   ├── vector_store.py              # Persistent TF-IDF/Cosine vector store & RBAC filters
│   │   │   ├── generator.py                 # Grounded response synthesizer & prompt-injection shield
│   │   │   └── store/                       # Persistent vector index & chunk metadata storage
│   │   │       ├── metadata.json
│   │   │       └── vector_model.joblib
│   │   │
│   │   ├── services/
│   │   │   ├── recommender.py               # Curriculum gap to syllabus topic & resource mapper
│   │   │   └── assistant.py                 # Role-aware campus assistant with live student context
│   │   │
│   │   └── api/
│   │       └── routes.py                    # Internal AI & RAG routes (health, predict, rag, chat)
│   │
│   └── tests/                               # Pytest test suite (12/12 passing)
│       ├── test_ml_pipeline.py
│       ├── test_rag_pipeline.py
│       └── test_recommendations.py
│
├── backend/                                 # Node.js & Express REST API Server (Port 5000)
│   ├── .env.example                         # Environment configuration template
│   ├── .env                                 # Local development environment settings
│   ├── package.json                         # Dependencies & scripts
│   ├── package-lock.json
│   ├── server.js                            # Express app entry point, route mounting & scheduler init
│   │
│   ├── config/
│   │   └── database.js                      # Resilient Mongoose connection manager
│   │
│   ├── models/
│   │   └── CampusModels.js                  # 16 Mongoose models
│   │
│   ├── services/
│   │   ├── aiService.js                     # MongoDB metrics aggregator, AI client & rule fallback
│   │   └── schedulerService.js              # Idempotent deadline reminders & background cron
│   │
│   ├── controllers/
│   │   ├── aiController.js                  # Academic insights, recommendations, early support, chat
│   │   └── ... (11 other controllers)
│   │
│   ├── routes/
│   │   ├── aiRoutes.js                      # /api/ai endpoints
│   │   └── ... (17 other route files)
│   │
│   └── tests/
│       └── api.test.js                      # Automated verification suite (33/33 tests passing)
│   │
│   ├── models/
│   │   └── CampusModels.js                  # 16 Mongoose models: User, Department, Course,
│   │                                        # Subject, StudentProfile, FacultyProfile, Attendance,
│   │                                        # TimetableEntry, Assignment, Examination, Result,
│   │                                        # FeeRecord, Notice, Resource, AIQueryLog,
│   │                                        # AttendanceSession, Notification, AuditLog
│   ├── middleware/
│   │   ├── authenticate.js                  # JWT & HttpOnly cookie verification
│   │   ├── authorize.js                     # Role-Based Access Control (RBAC) guard
│   │   └── errorHandler.js                  # Centralized 404 & Mongoose error handling
│   │
│   ├── services/
│   │   └── schedulerService.js              # Idempotent deadline reminders & background cron
│   │
│   ├── validators/
│   │   └── authValidators.js                # Input validation & security guards
│   │
│   ├── controllers/
│   │   ├── authController.js                # Auth, registration, login, logout, session check
│   │   ├── userController.js                # User profile management
│   │   ├── dashboardController.js           # Student, Faculty, & Admin data aggregators
│   │   ├── studentController.js             # Student CRUD, profile & cohort directory
│   │   ├── facultyController.js             # Faculty staff CRUD, workload allocations
│   │   ├── departmentController.js          # Academic divisions & HOD governance
│   │   ├── courseController.js              # Program degrees & syllabus subjects
│   │   ├── attendanceController.js          # Turnout logs, mark attendance, compliance %
│   │   ├── qrAttendanceController.js        # Dynamic QR token generation & check-in verification
│   │   ├── analyticsController.js           # Institutional, Faculty, and Student analytics
│   │   ├── notificationController.js        # Notification hub, unread counts, mark-read
│   │   ├── timetableController.js           # 3-way conflict checking (Room, Faculty, Class)
│   │   ├── assignmentController.js          # Assignment lifecycle, student submission, grading
│   │   ├── examController.js                # Exam schedules, result entry, UGC 10-point GPA
│   │   ├── feeController.js                 # Fee invoices, payments, auto-balance calculation
│   │   ├── noticeController.js              # Campus circulars & priority broadcasts
│   │   └── resourceController.js            # Study materials, syllabus notes, repository
│   │
│   ├── routes/
│   │   ├── authRoutes.js                    # /api/auth/*
│   │   ├── userRoutes.js                    # /api/users/*
│   │   ├── dashboardRoutes.js               # /api/dashboard/*
│   │   ├── studentRoutes.js                 # /api/students/*
│   │   ├── facultyRoutes.js                 # /api/faculty/*
│   │   ├── departmentRoutes.js              # /api/departments/*
│   │   ├── courseRoutes.js                  # /api/courses/* & /api/subjects/*
│   │   ├── attendanceRoutes.js              # /api/attendance/* & /api/attendance/session/*
│   │   ├── analyticsRoutes.js               # /api/analytics/*
│   │   ├── notificationRoutes.js            # /api/notifications/*
│   │   ├── timetableRoutes.js               # /api/timetable/*
│   │   ├── assignmentRoutes.js              # /api/assignments/*
│   │   ├── examRoutes.js                    # /api/examinations/* & /api/results/*
│   │   ├── feeRoutes.js                     # /api/fees/*
│   │   ├── noticeRoutes.js                  # /api/notices/*
│   │   └── resourceRoutes.js                # /api/resources/*
│   │
│   ├── scripts/
│   │   └── seedDemoUsers.js                 # Phase 1, 2, and 3 comprehensive database seeder
│   │
│   └── tests/
│       └── api.test.js                      # 28-point automated verification suite (Phases 1-3)
│
└── client/                                  # React + Vite Frontend Application
    ├── .env.example                         # Client environment template
    ├── .env                                 # VITE_API_BASE_URL=http://localhost:5000/api
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx                          # Comprehensive routes & role guards
        ├── main.jsx                         # React root mount
        ├── index.css                        # Tailwind directives & theme
        │
        ├── context/
        │   └── AuthContext.jsx              # Global authentication state & session hooks
        │
        ├── services/
        │   └── api.js                       # Axios client with Bearer interceptors
        │
        ├── components/
        │   ├── DashboardLayout.jsx          # Master layout (Sidebar + Navbar)
        │   ├── Navbar.jsx                   # Interactive Notification Bell dropdown & user menu
        │   ├── Sidebar.jsx                  # Collapsible, role-aware navigation
        │   ├── ProtectedRoute.jsx           # Role security route guard
        │   ├── StatCard.jsx                 # Analytical metric card
        │   └── LoadingSkeleton.jsx          # UX skeleton loader
        │
        └── pages/
            ├── LoginPage.jsx                # One-click demo account selector
            ├── RegisterPage.jsx             # Student & Faculty registration
            ├── ProfilePage.jsx              # Personal profile & security
            ├── UnauthorizedPage.jsx         # 403 Forbidden handler
            ├── NotFoundPage.jsx             # 404 Not Found handler
            │
            ├── # Student Portal Pages
            │   ├── StudentDashboard.jsx     # Overview, analytics summary & QR check-in shortcut
            │   ├── StudentCoursesPage.jsx   # Enrolled courses, credits, faculty
            │   ├── StudentAttendancePage.jsx# Compliance gauge, subject breakdown & QR/code check-in modal
            │   ├── StudentTimetablePage.jsx # Weekly schedule grid with day selector
            │   ├── StudentAssignmentsPage.jsx# Coursework submission & grade review
            │   ├── StudentResultsPage.jsx   # Semester grade sheet & GPA transcript
            │   ├── StudentFeesPage.jsx      # Fee invoices, cleared dues, payment receipts
            │   ├── StudentResourcesPage.jsx # Downloadable study materials & notes
            │   ├── StudentNoticesPage.jsx   # University & departmental circulars
            │   └── StudentAIPage.jsx        # Dedicated AI Academic Advisor chat
            │
            ├── # Faculty Portal Pages
            │   ├── FacultyDashboard.jsx     # Overview, at-risk student telemetry, QR shortcut
            │   ├── FacultyClassesPage.jsx   # Assigned teaching modules & enrolled cohorts
            │   ├── FacultyAttendancePage.jsx# Interactive roll call & Launch QR session modal
            │   ├── FacultyAssignmentsPage.jsx# Coursework creator & submission evaluator
            │   ├── FacultyPerformancePage.jsx# Exam marks entry & UGC grade rubric
            │   ├── FacultyMaterialsPage.jsx # Study materials & notes repository publisher
            │   └── FacultyNoticesPage.jsx   # Department announcements broadcast
            │
            └── # Admin Portal Pages
                ├── AdminDashboard.jsx       # University control center & system health
                ├── AdminStudentsPage.jsx    # Student admissions & directory management
                ├── AdminFacultyPage.jsx     # Faculty appointments & staff roster
                ├── AdminDepartmentsPage.jsx # Academic divisions & HOD governance
                ├── AdminCoursesPage.jsx     # Degree programs & syllabus catalog
                ├── AdminTimetablePage.jsx   # 3-way collision-free schedule manager
                ├── AdminAttendancePage.jsx  # Campus-wide attendance audit & reports
                ├── AdminFeesPage.jsx        # Student bursar ledger & payment recorder
                ├── AdminNoticesPage.jsx     # Official campus circulars broadcast
                └── AdminAnalyticsPage.jsx   # Recharts charts: Weekly turnout, Dept stats, Grade distribution
```

---

## 2. Technology Stack

### Frontend (`client/`)
- **React 18** + **Vite 5** (Fast HMR & Optimized production build)
- **Tailwind CSS 3** (Custom University SaaS theme: Deep Navy `#0f172a`, Indigo `#4f46e5`, Teal `#0d9488`)
- **React Router DOM 6** (Client-side routing with nested role guards)
- **Recharts 2.15** (Responsive AreaCharts, BarCharts, and PieCharts)
- **Axios** (Configured with request/response interceptors and cookie support)
- **Lucide React** (Modern, accessible iconography)

### Backend (`backend/`)
- **Node.js 24** & **Express 5**
- **Mongoose 9** with **MongoDB**
- **qrcode** (Dynamic Base64 Data URL generation for mobile/projector scanning)
- **node-cron** (Background task scheduling for deadline reminders)
- **bcryptjs** (Salted password hashing, 10 rounds)
- **jsonwebtoken** (Signed Bearer tokens & HttpOnly cookie support)
- **cookie-parser** (Session cookie extraction)
- **supertest** (Integration test runner)

### AI Service (`ai-service/`)
- **Python 3.11** + **FastAPI** & **Uvicorn** (Foundation for Phase 4 RAG)

---

## 3. Installation & Setup (Windows PowerShell)

### Prerequisites
- Node.js (v18+ recommended; verified on Node v24)
- npm (v9+)
- Python (v3.10+; verified on Python 3.11)
- MongoDB (Running on `localhost:27017` as a Windows service)

### Step 1: Backend Setup & Database Seeding
```powershell
cd "C:\VS CODE\SMARTCAMPUS\backend"

# Run Comprehensive Database Seeder:
node scripts/seedDemoUsers.js
# Or:
npm run seed
```

### Step 2: Client Build Verification
```powershell
cd "C:\VS CODE\SMARTCAMPUS\client"

# Build production bundle:
npm run build
```

---

## 4. Running the Application

### Option A: Development Mode (Live Reloading)

**Terminal 1 — Backend API Server (Port 5000):**
```powershell
cd "C:\VS CODE\SMARTCAMPUS\backend"
npm run dev
```

**Terminal 2 — React Frontend (Port 5173):**
```powershell
cd "C:\VS CODE\SMARTCAMPUS\client"
npm run dev
```

Visit in your browser: `http://localhost:5173`

---

## 5. Demo Accounts for Evaluation & Viva

The Login page features **One-Click Demo Account Buttons** that instantly pre-fill verified credentials:

| Role | Email | Password | Access Path | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@smartcampus.edu` | `Student@123` | `/student/dashboard` | Attendance compliance (88.5%), QR code / session code check-in, notification bell dropdown, registered courses, weekly timetable grid, assignment submitter, exam grade sheet, fee balance tracker, study resources, and AI academic advisor |
| **Faculty** | `faculty@smartcampus.edu` | `Faculty@123` | `/faculty/dashboard` | Assigned classes, launch QR attendance session with countdown & live attendee roster, coursework creator & evaluator, exam marks evaluation, study materials publisher, notice broadcaster, at-risk student monitoring |
| **Admin** | `admin@smartcampus.edu` | `Admin@123` | `/admin/dashboard` | Student admissions, faculty appointments, departments, course catalog, 3-way collision-free timetable scheduler, fee collection ledger, campus circulars, interactive Recharts telemetry |

---

## 6. Automated Testing (28/28 Passing)

The backend includes a comprehensive 28-point automated verification suite powered by Node.js native test runner and `supertest`:

```powershell
cd "C:\VS CODE\SMARTCAMPUS\backend"
npm test
```

### Verified Test Suite:
1. **Health Endpoint** (`GET /api/health` returns status 200 and connection state)
2. **Registration** (`POST /api/auth/register` creates user & generates JWT)
3. **Duplicate-Email Rejection** (Rejects existing email with 400)
4. **Password Hashing** (Bcrypt salted hash verification, plaintext never exposed)
5. **Login Authentication** (Validates correct password, rejects invalid credentials)
6. **Authenticated User Retrieval** (`GET /api/auth/me` and `/api/users/me`)
7. **Logout** (`POST /api/auth/logout` clears session)
8. **Student Authorization** (Permitted on student dashboard, 403 on admin dashboard)
9. **Faculty Authorization** (Permitted on faculty dashboard, 403 on admin dashboard)
10. **Admin Authorization** (Full access to admin dashboard and user lists)
11. **Protected Route Guards** (Unauthenticated requests rejected with 401)
12. **Request Validation** (Rejects malformed emails and public admin creation)
13. **Dashboard Structured Responses** (Returns non-null analytical metrics)
14. **Frontend Production Build** (Verifies `client/dist/index.html` build artifact)
15. **Session Persistence & Invalid Token Guard** (Rejects tampered tokens)
16. **Department, Course & Subject CRUD** (Admin creates academic hierarchy)
17. **Student & Faculty Management** (Admin registers student & faculty profiles)
18. **Timetable 3-Way Conflict Detection** (Prevents Room, Faculty, and Class overlaps with HTTP 409)
19. **Attendance Marking & Aggregate Recalculation** (Faculty marks session, compliance auto-updated)
20. **Assignment Lifecycle** (Faculty creates, Student submits, Faculty grades)
21. **Examination & Result Grading** (Computes UGC 10-point scale grade & GPA)
22. **Fee Invoicing & Payment Recalculation** (Pre-save hook dynamically balances ledger)
23. **Campus Notices Broadcast** (Publishes and broadcasts circulars across roles)
24. **Role-Based Analytics Overview** (Admin, Faculty, and Student aggregated telemetry & access guards)
25. **Dynamic QR Attendance Session Lifecycle** (Creation, live polling, and early termination)
26. **QR / Code Check-in Verification & Fraud Prevention** (Valid check-in, duplicate scan rejection, closed session rejection)
27. **Notification Hub & Unread Telemetry** (Alerts list, unread count polling, mark single as read, mark all read)
28. **Scheduler Service & Idempotent Reminders** (Idempotent 48h assignment deadline reminder daemon)
29. **Academic Performance Insights** (Student fetches academic metrics with explainable ML diagnostics)
30. **Personalized Recommendations** (Curriculum syllabus topics and matched library resources)
31. **Faculty Early-Support Roster** (Cohort risk analysis with student risk factors)
32. **Role-Aware AI Campus Assistant** (Verified student context injection & query validation)
33. **AI Service Health & Fallback** (Service availability and rule engine fallback readiness)
34. **RAG Resource Upload & Vector Indexing** (Faculty publishes study material and triggers vector store ingestion)
35. **RAG Grounded Query & Citations** (Student queries authorized materials with genuine citations: title, page, excerpt)
36. **Document-Level RBAC Security** (Student queries outside enrolled department/subjects receive 0 citations)
37. **Prompt Injection Defense** (Malicious prompt injection attempts in query or text fail to leak credentials)
38. **Resource Deletion Vector Purge** (Resource deletion purges document and chunks from RAG vector store)

---

## 7. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new student or faculty account.
- `POST /api/auth/login`: Authenticate and receive JWT token & HttpOnly cookie.
- `POST /api/auth/logout`: Invalidate session and clear auth cookie.
- `GET /api/auth/me`: Retrieve current user profile and role details.

### Analytics & System Telemetry (`/api/analytics`)
- `GET /api/analytics/admin/overview`: Institutional headcounts, turnout trends, department distributions, fee ledger totals.
- `GET /api/analytics/faculty/overview`: Subject turnout rates, assignment completion, at-risk students list (<75% attendance).
- `GET /api/analytics/student/overview`: Personal attendance compliance, assignment progress, exam GPA trends.

### Dynamic QR Attendance (`/api/attendance`)
- `POST /api/attendance/session/create`: Generate short-lived QR token and 6-char fallback session code.
- `POST /api/attendance/session/scan`: Student check-in via QR token or session code with duplicate guard.
- `GET /api/attendance/session/:id/status`: Live attendee counter and time remaining.
- `PATCH /api/attendance/session/:id/close`: Faculty early session termination.

### Notifications Hub (`/api/notifications`)
- `GET /api/notifications`: Retrieve paginated user notifications.
- `GET /api/notifications/unread-count`: Lightweight unread counter for navbar bell badge.
- `PATCH /api/notifications/:id/read`: Mark individual alert as read.
- `PATCH /api/notifications/read-all`: Mark all notifications as read.

### Core Campus Management (`/api`)
- `GET, POST /api/departments`: Department management & HOD appointments.
- `GET, POST /api/courses`: Degree programs accreditation.
- `GET, POST /api/subjects`: Syllabus course subjects.
- `GET, POST /api/students`: Student admissions & cohort directory.
- `GET, POST /api/faculty`: Faculty appointments & staff roster.
- `GET, POST /api/attendance`: Session turnout logs & bulk marking.
- `GET, POST /api/timetable`: Weekly routine scheduler with conflict checks.
- `GET, POST, PATCH /api/assignments`: Coursework creation, submissions, and grading.
- `GET, POST /api/examinations` & `/api/results`: Exam scheduling, marks entry, and GPA.
- `GET, POST, PATCH /api/fees`: Fee invoices, payment installments, and balance tracking.
- `GET, POST /api/notices`: University bulletin announcements.
- `GET, POST /api/resources`: Study materials and lecture notes repository.
- `POST /api/resources/:id/reindex`: Re-trigger RAG chunking and vector indexing.
- `GET /api/resources/:id/processing-status`: Check document RAG indexing status.
- `POST /api/seed`: Re-seed demo dataset.

### AI & Machine Learning (`/api/ai`)
- `GET /api/ai/academic-insights`: Student academic performance metrics and explainable ML risk diagnostics.
- `GET /api/ai/recommendations`: Personalized syllabus curriculum topics and matched digital library assets.
- `GET /api/ai/early-support`: Faculty/Admin cohort risk analysis or individual student diagnostic.
- `POST /api/ai/chat`: Role-aware conversational campus assistant with live student records.
- `GET /api/ai/status`: Health and operational readiness of Python AI microservice and fallback engine.
- `POST /api/ai/ml/retrain`: Admin trigger to retrain `RandomForestClassifier` on benchmark dataset.

### RAG Academic Document Assistant (`/api/ai/document-assistant`)
- `POST /api/ai/document-assistant/query`: Grounded student document inquiry with verified citations and fail-closed RBAC.
- `GET /api/ai/rag/status`: Vector store metrics (total documents, indexed chunks, vector index status).

---

## 8. Phases 1–5 Implementation Status

- [x] **Phase 1: Architecture, Authentication & Responsive Shells**: JWT, RBAC guards, Tailwind dashboards, Mongo connection manager.
- [x] **Phase 2: Core Campus Operations**: Timetable 3-way conflict detection, Attendance compliance, Assignments lifecycle, Results GPA, Fee ledger.
- [x] **Phase 3: Interactive Features & System Telemetry**: Dynamic QR Attendance sessions, Notifications Hub, Institutional Analytics, Idempotent Deadline Daemon.
- [x] **Phase 4: AI & Machine Learning Integration**: FastAPI microservice, Scikit-learn `RandomForestClassifier` (96.67% accuracy), Explainable risk factors, Personalized syllabus recommendations, Role-aware AI campus assistant.
- [x] **Phase 5: RAG-Powered Academic Document Assistant**:
  - Genuine PDF/Text page-by-page extraction with `pypdf`.
  - Scanned PDF detection & graceful rejection (<30 chars).
  - Overlapping semantic chunker (450 chars, 80 overlap).
  - Persistent disk-backed vector store (TF-IDF + Cosine similarity space).
  - Strict server-side RBAC access filtering (cross-subject fail-closed defense).
  - Prompt-injection defense shields and honest insufficiency policy.
  - Zero-citation fabrication guarantee.
  - Extractive deterministic fallback when Python microservice or LLM is offline.

