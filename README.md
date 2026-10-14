# SmartCampus AI — Intelligent University Management & Student Support System

> **BCA Final-Year Major Project**  
> **Workspace**: `C:\VS CODE\SMARTCAMPUS`  
> **Version**: 2.0.0 (Phase 1 & Phase 2 Complete: Core Campus Management)

SmartCampus AI is an enterprise-grade university management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and prepared for Python FastAPI RAG-based AI services in Phase 3. It provides comprehensive, role-based portals for **Students**, **Faculty**, and **Administrators** with real-time analytics, automated conflict-free timetable scheduling, attendance tracking, coursework submission and grading, examination results, fee ledger calculations, and campus announcements.

---

## 1. Project Architecture & Structure

```
SMARTCAMPUS/
├── .gitignore
├── README.md
│
├── ai-service/                              # Python AI Microservice (Phase 3 Foundation)
│   ├── main.py                              # FastAPI service & RAG endpoint skeleton
│   ├── requirements.txt                     # FastAPI & Uvicorn dependencies
│   └── README.md                            # Phase 3 AI Roadmap & local setup guide
│
├── backend/                                 # Node.js & Express REST API Server
│   ├── .env.example                         # Environment configuration template
│   ├── .env                                 # Local development environment settings
│   ├── package.json                         # Dependencies & scripts
│   ├── package-lock.json
│   ├── server.js                            # Express app entry point & route mounting
│   │
│   ├── config/
│   │   └── database.js                      # Resilient Mongoose connection manager
│   │
│   ├── models/
│   │   └── CampusModels.js                  # 13 Mongoose models: User, Department, Course,
│   │                                        # Subject, StudentProfile, FacultyProfile, Attendance,
│   │                                        # TimetableEntry, Assignment, Examination, Result,
│   │                                        # FeeRecord, Notice, Resource, AIQueryLog
│   ├── middleware/
│   │   ├── authenticate.js                  # JWT & HttpOnly cookie verification
│   │   ├── authorize.js                     # Role-Based Access Control (RBAC) guard
│   │   └── errorHandler.js                  # Centralized 404 & Mongoose error handling
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
│   │   ├── attendanceRoutes.js              # /api/attendance/*
│   │   ├── timetableRoutes.js               # /api/timetable/*
│   │   ├── assignmentRoutes.js              # /api/assignments/*
│   │   ├── examRoutes.js                    # /api/examinations/* & /api/results/*
│   │   ├── feeRoutes.js                     # /api/fees/*
│   │   ├── noticeRoutes.js                  # /api/notices/*
│   │   └── resourceRoutes.js                # /api/resources/*
│   │
│   ├── scripts/
│   │   └── seedDemoUsers.js                 # Phase 2 comprehensive database seeder
│   │
│   └── tests/
│       └── api.test.js                      # 23-point automated verification suite
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
        ├── App.jsx                          # Comprehensive Phase 2 routes & role guards
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
        │   ├── Navbar.jsx                   # Top navigation with alerts & profile menu
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
            │   ├── StudentDashboard.jsx     # Overview & AI consultation widget
            │   ├── StudentCoursesPage.jsx   # Enrolled courses, credits, faculty
            │   ├── StudentAttendancePage.jsx# Compliance gauge, subject breakdown, history
            │   ├── StudentTimetablePage.jsx # Weekly schedule grid with day selector
            │   ├── StudentAssignmentsPage.jsx# Coursework submission & grade review
            │   ├── StudentResultsPage.jsx   # Semester grade sheet & GPA transcript
            │   ├── StudentFeesPage.jsx      # Fee invoices, cleared dues, payment receipts
            │   ├── StudentResourcesPage.jsx # Downloadable study materials & notes
            │   ├── StudentNoticesPage.jsx   # University & departmental circulars
            │   └── StudentAIPage.jsx        # Dedicated AI Academic Advisor chat
            │
            ├── # Faculty Portal Pages
            │   ├── FacultyDashboard.jsx     # Faculty overview & quick actions
            │   ├── FacultyClassesPage.jsx   # Assigned teaching modules & enrolled cohorts
            │   ├── FacultyAttendancePage.jsx# Interactive roll call & bulk status marking
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
                └── AdminAnalyticsPage.jsx   # Infrastructure telemetry & system status
```

---

## 2. Technology Stack

### Frontend (`client/`)
- **React 18** + **Vite 5** (Fast HMR & Optimized production build)
- **Tailwind CSS 3** (Custom University SaaS theme: Deep Navy `#0f172a`, Indigo `#4f46e5`, Teal `#0d9488`)
- **React Router DOM 6** (Client-side routing with nested role guards)
- **Axios** (Configured with request/response interceptors and cookie support)
- **Lucide React** (Modern, clean icon set)

### Backend (`backend/`)
- **Node.js 24** & **Express 5**
- **Mongoose 9** with **MongoDB**
- **bcryptjs** (Salted password hashing, 10 rounds)
- **jsonwebtoken** (Signed Bearer tokens & HttpOnly cookie support)
- **cookie-parser** (Session cookie extraction)
- **supertest** & **mongodb-memory-server** (In-memory testing)

### AI Service (`ai-service/`)
- **Python 3.11** + **FastAPI** & **Uvicorn** (Foundation for Phase 3 RAG)

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

# Run Phase 2 Comprehensive Seeding:
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

| Role | Email | Password | Access Path | Key Phase 2 Features |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@smartcampus.edu` | `Student@123` | `/student/dashboard` | Attendance metrics (88.5%), registered courses, weekly timetable grid, assignment submitter, exam grade sheet, fee balance tracker, study resources, and AI academic advisor |
| **Faculty** | `faculty@smartcampus.edu` | `Faculty@123` | `/faculty/dashboard` | Assigned classes, interactive attendance roll call with bulk save, coursework creator & grader, exam marks evaluation, study materials publisher, notice broadcaster |
| **Admin** | `admin@smartcampus.edu` | `Admin@123` | `/admin/dashboard` | Complete student admissions, faculty appointments, departments, course catalog, 3-way collision-free timetable scheduler, fee collection ledger, campus circulars |

---

## 6. Automated Testing (23/23 Passing)

The backend includes a comprehensive 23-point automated verification suite powered by Node.js native test runner and `supertest`:

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

---

## 7. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new student or faculty account.
- `POST /api/auth/login`: Authenticate and receive JWT token & HttpOnly cookie.
- `POST /api/auth/logout`: Invalidate session and clear auth cookie.
- `GET /api/auth/me`: Retrieve current user profile and role details.

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
- `GET, POST /api/resources`: Study materials and lecture notes.
- `POST /api/ai/chat`: AI Academic Assistant consultation.
- `POST /api/seed`: Re-seed demo dataset.

---

## 8. Phase 3 AI/ML Roadmap

- [ ] **RAG Campus Knowledge Engine**: Ingest university syllabus PDFs, examination guidelines, and fee circulars into ChromaDB / pgvector.
- [ ] **Student At-Risk Predictor**: Machine learning model analyzing attendance drops and assignment marks for early intervention.
- [ ] **Automated Timetable Optimizer**: Constraint-satisfaction algorithm (OR-Tools) for multi-hall scheduling.
- [ ] **Voice-Enabled Student Helpdesk**: Whisper STT & TTS integration.
