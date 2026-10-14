# SmartCampus AI — Intelligent University Management & Student Support System

> **BCA Final-Year Major Project**  
> **Workspace**: `C:\VS CODE\SMARTCAMPUS`  
> **Version**: 1.0.0 (Phase 1 Complete)

SmartCampus AI is an enterprise-grade university management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and prepared for Python FastAPI RAG-based AI services in Phase 2. It provides role-based academic portals for **Students**, **Faculty**, and **Administrators** with real-time analytics, course management, attendance tracking, and instant AI student assistance.

---

## 1. Project Architecture & Structure

```
SMARTCAMPUS/
├── .gitignore
├── README.md
│
├── ai-service/                              # Python AI Microservice (Phase 2 Foundation)
│   ├── main.py                              # FastAPI starter service & RAG endpoint skeleton
│   ├── requirements.txt                     # FastAPI & Uvicorn dependencies
│   └── README.md                            # Phase 2 AI Roadmap & local setup guide
│
├── backend/                                 # Node.js & Express REST API Server
│   ├── .env.example                         # Environment configuration template
│   ├── .env                                 # Local development environment settings
│   ├── package.json                         # Dependencies & scripts
│   ├── package-lock.json
│   ├── server.js                            # Express app entry point & lifecycle
│   │
│   ├── config/
│   │   └── database.js                      # Resilient Mongoose connection manager
│   │
│   ├── models/
│   │   └── CampusModels.js                  # User, StudentProfile, FacultyProfile, Course,
│   │                                        # Attendance, Assignment, Notice, AIQueryLog
│   ├── middleware/
│   │   ├── authenticate.js                  # JWT & HttpOnly cookie verification
│   │   ├── authorize.js                     # Role-Based Access Control (RBAC) guard
│   │   └── errorHandler.js                  # Centralized 404 & Mongoose error handling
│   │
│   ├── validators/
│   │   └── authValidators.js                # Input validation & security guards
│   │
│   ├── controllers/
│   │   ├── authController.js                # Registration, login, logout, session check
│   │   ├── userController.js                # User profile management
│   │   └── dashboardController.js           # Student, Faculty, & Admin data aggregators
│   │
│   ├── routes/
│   │   ├── authRoutes.js                    # /api/auth/*
│   │   ├── userRoutes.js                    # /api/users/*
│   │   ├── dashboardRoutes.js               # /api/dashboard/*
│   │   └── academicRoutes.js                # /api/courses, /api/notices, /api/ai/chat
│   │
│   ├── scripts/
│   │   └── seedDemoUsers.js                 # Idempotent demo database populator
│   │
│   └── tests/
│       └── api.test.js                      # 15-point automated verification suite
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
        ├── App.jsx                          # Route definitions & guards
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
        │   ├── DashboardLayout.jsx          # Shared master layout (Sidebar + Navbar)
        │   ├── Navbar.jsx                   # Top navigation with alerts & profile menu
        │   ├── Sidebar.jsx                  # Collapsible, role-aware navigation
        │   ├── ProtectedRoute.jsx           # Role security route guard
        │   ├── StatCard.jsx                 # Analytical metric card
        │   └── LoadingSkeleton.jsx          # Smooth UX loading skeleton
        │
        └── pages/
            ├── LoginPage.jsx                # Login with one-click demo selectors
            ├── RegisterPage.jsx             # Student & Faculty registration
            ├── StudentDashboard.jsx         # Attendance, courses, and AI assistant
            ├── FacultyDashboard.jsx         # Course allocation & grading overview
            ├── AdminDashboard.jsx           # System stats & user management
            ├── ProfilePage.jsx              # Personal profile editor
            ├── UnauthorizedPage.jsx         # 403 Forbidden handler
            └── NotFoundPage.jsx             # 404 Not Found handler
```

---

## 2. Technology Stack

### Frontend (`client/`)
- **React 18** + **Vite 5** (Fast HMR & Optimized build output)
- **Tailwind CSS 3** (Custom University SaaS theme: Deep Navy `#0f172a`, Indigo `#4f46e5`, Teal `#0d9488`)
- **React Router DOM 6** (Client-side routing with nested role guards)
- **Axios** (Configured with request/response interceptors and cookie support)
- **Lucide React** (Clean, modern icon set)

### Backend (`backend/`)
- **Node.js 24** & **Express 5**
- **Mongoose 9** with **MongoDB**
- **bcryptjs** (Salted password hashing, 10 rounds)
- **jsonwebtoken** (Signed Bearer tokens & HttpOnly cookie support)
- **cookie-parser** (Session cookie extraction)
- **supertest** & **mongodb-memory-server** (In-memory testing)

### AI Service (`ai-service/`)
- **Python 3.11** + **FastAPI** & **Uvicorn** (Prepared for Phase 2 RAG)

---

## 3. Installation & Setup (Windows PowerShell)

### Prerequisites
- Node.js (v18+ recommended; verified on Node v24)
- npm (v9+)
- Python (v3.10+; verified on Python 3.11)
- MongoDB (Local Community Server on `localhost:27017` or MongoDB Atlas URI)

### Step 1: Backend Setup
```powershell
# Navigate to backend
cd "C:\VS CODE\SMARTCAMPUS\backend"

# Dependencies are already installed. If needed:
npm install

# (Optional) Seed the database with demo accounts & courses:
npm run seed
```

### Step 2: Client Setup
```powershell
# Navigate to client
cd "C:\VS CODE\SMARTCAMPUS\client"

# Dependencies are already installed. If needed:
npm install

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
| **Student** | `student@smartcampus.edu` | `Student@123` | `/student/dashboard` | Attendance metrics (91.5%), enrolled courses, timetable, and interactive AI student assistant |
| **Faculty** | `faculty@smartcampus.edu` | `Faculty@123` | `/faculty/dashboard` | Assigned courses (BCA-501, BCA-502), student count, submission counter, notice publisher |
| **Admin** | `admin@smartcampus.edu` | `Admin@123` | `/admin/dashboard` | User accounts table, system health, infrastructure status, one-click database re-seeder |

---

## 6. Automated Testing

The backend includes a comprehensive 15-point automated verification suite powered by Node.js native test runner and `supertest`:

```powershell
cd "C:\VS CODE\SMARTCAMPUS\backend"
npm test
```

### Verified Test Suite (15/15 Passing):
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

---

## 7. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new student or faculty account.
- `POST /api/auth/login`: Authenticate and receive JWT token & HttpOnly cookie.
- `POST /api/auth/logout`: Invalidate session and clear auth cookie.
- `GET /api/auth/me`: Retrieve current user profile and role details.

### User Management (`/api/users`)
- `GET /api/users/me`: Current user details.
- `PATCH /api/users/me`: Update name, phone, department.
- `GET /api/users`: List all registered university users (Admin only).

### Dashboards (`/api/dashboard`)
- `GET /api/dashboard/student`: Student courses, attendance summary, notices.
- `GET /api/dashboard/faculty`: Assigned courses, students enrolled, pending grading.
- `GET /api/dashboard/admin`: System metrics, recent user list, uptime.

### Academic & AI Gateway (`/api`)
- `GET /api/courses` & `POST /api/courses`: Course catalog.
- `GET /api/notices` & `POST /api/notices`: Campus bulletin board.
- `GET /api/attendance/summary` & `POST /api/attendance/mark`: Attendance tracking.
- `POST /api/ai/chat`: AI Academic Assistant with Python FastAPI integration and intelligent rule fallback.
- `POST /api/seed`: Re-seed demo database.

---

## 8. Phase 2 AI/ML Roadmap

- [ ] **RAG Campus Knowledge Engine**: Ingest university syllabus PDFs, examination guidelines, and fee circulars into ChromaDB.
- [ ] **Student At-Risk Predictor**: Machine learning model analyzing attendance drops and assignment marks.
- [ ] **Automated Timetable Optimizer**: Constraint-satisfaction algorithm for classroom allocations.
- [ ] **Voice-Enabled Student Helpdesk**: Whisper STT & TTS integration.

