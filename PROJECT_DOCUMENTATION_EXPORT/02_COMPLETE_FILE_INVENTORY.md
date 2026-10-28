# SmartCampus AI — Complete Repository File Inventory

**Document ID:** `02_COMPLETE_FILE_INVENTORY`  
**Version:** 6.0.0  
**Generated Date:** 2026-10-28  
**Repository Working Directory:** `/Users/anurag93/Downloads/CodingZone/MajorProjects/SMARTCAMPUS`  
**Classification:** Technical File Catalog & Module Dependency Index  

---

## 1. Directory Tree Summary

```
SMARTCAMPUS/
├── .github/
│   └── workflows/ci.yml
├── ai-service/
│   ├── app/
│   │   ├── api/routes.py
│   │   ├── ml/
│   │   │   ├── pipeline.py
│   │   │   ├── support_model_meta.json
│   │   │   ├── support_model.joblib
│   │   │   ├── synthetic_data.py
│   │   │   └── train.py
│   │   ├── rag/
│   │   │   ├── store/
│   │   │   │   ├── metadata.json
│   │   │   │   └── vector_model.joblib
│   │   │   ├── __init__.py
│   │   │   ├── chunker.py
│   │   │   ├── generator.py
│   │   │   ├── text_extractor.py
│   │   │   └── vector_store.py
│   │   ├── services/
│   │   │   ├── assistant.py
│   │   │   └── recommender.py
│   │   ├── config.py
│   │   ├── main.py
│   │   └── schemas.py
│   ├── tests/
│   │   ├── test_ml_pipeline.py
│   │   ├── test_rag_pipeline.py
│   │   └── test_recommendations.py
│   ├── Dockerfile
│   ├── main.py
│   ├── pytest.ini
│   ├── README.md
│   └── requirements.txt
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── envValidator.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── analyticsController.js
│   │   ├── assignmentController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── dashboardController.js
│   │   ├── departmentController.js
│   │   ├── examController.js
│   │   ├── facultyController.js
│   │   ├── feeController.js
│   │   ├── feeStructureController.js
│   │   ├── noticeController.js
│   │   ├── notificationController.js
│   │   ├── qrAttendanceController.js
│   │   ├── registrationController.js
│   │   ├── resourceController.js
│   │   ├── studentController.js
│   │   ├── timetableController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── AIQueryLog.js
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   ├── AttendanceSession.js
│   │   ├── AuditLog.js
│   │   ├── CampusModels.js
│   │   ├── Course.js
│   │   ├── Department.js
│   │   ├── Examination.js
│   │   ├── FacultyProfile.js
│   │   ├── FeeRecord.js
│   │   ├── FeeStructure.js
│   │   ├── Notice.js
│   │   ├── Notification.js
│   │   ├── PaymentTransaction.js
│   │   ├── RegistrationRequest.js
│   │   ├── Resource.js
│   │   ├── Result.js
│   │   ├── StudentProfile.js
│   │   ├── Subject.js
│   │   ├── TimetableEntry.js
│   │   └── User.js
│   ├── routes/
│   │   ├── academicRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── examRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── timetableRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   ├── backupDatabase.js
│   │   ├── restoreDatabase.js
│   │   └── seedDemoUsers.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── paymentService.js
│   │   ├── ragService.js
│   │   └── schedulerService.js
│   ├── tests/
│   │   ├── api.test.js
│   │   ├── feeManagement.test.js
│   │   ├── payment.test.js
│   │   └── registration.test.js
│   ├── validators/
│   │   └── authValidators.js
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── client/
│   ├── public/
│   │   └── assets/smartcampus-ai-logo.svg
│   ├── scripts/
│   │   ├── generate-cert.js
│   │   └── trust-cert.bat
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProfilePictureModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SmartCampusLogo.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminAnalyticsPage.jsx
│   │   │   ├── AdminAttendancePage.jsx
│   │   │   ├── AdminCoursesPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDepartmentsPage.jsx
│   │   │   ├── AdminFacultyPage.jsx
│   │   │   ├── AdminFeesPage.jsx
│   │   │   ├── AdminNoticesPage.jsx
│   │   │   ├── AdminRegistrationsPage.jsx
│   │   │   ├── AdminSettingsPage.jsx
│   │   │   ├── AdminStudentsPage.jsx
│   │   │   ├── AdminTimetablePage.jsx
│   │   │   ├── FacultyAssignmentsPage.jsx
│   │   │   ├── FacultyAttendancePage.jsx
│   │   │   ├── FacultyClassesPage.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── FacultyMaterialsPage.jsx
│   │   │   ├── FacultyNoticesPage.jsx
│   │   │   ├── FacultyPerformancePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── StudentAIPage.jsx
│   │   │   ├── StudentAssignmentsPage.jsx
│   │   │   ├── StudentAttendancePage.jsx
│   │   │   ├── StudentCoursesPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentFeesPage.jsx
│   │   │   ├── StudentNoticesPage.jsx
│   │   │   ├── StudentResourcesPage.jsx
│   │   │   ├── StudentResultsPage.jsx
│   │   │   ├── StudentTimetablePage.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tests/
│   │   └── frontend.test.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── scripts/
│   ├── start-all.js
│   ├── stop-all.js
│   ├── test-profile-picture.js
│   └── verify-live-e2e.js
├── docker-compose.yml
├── package.json
├── README.md
├── start-all.bat
└── stop-all.bat
```

---

## 2. Root Files & Infrastructure Scripts

| File Path | Type | Responsibility & Purpose | Key Exports / Definitions | Upstream Dependencies / Callers | Status |
|---|---|---|---|---|---|
| `package.json` | JSON | Root project orchestrator manifest. Defines concurrent dev and test scripts. | Scripts: `dev`, `start`, `stop`, `test`, `test:live`, `backup`, `restore`, `seed` | Invoked by developers via npm CLI. | Connected |
| `docker-compose.yml` | YAML | Multi-container Docker configuration for MongoDB, AI microservice, Backend API, and Frontend Nginx. | Services: `mongodb`, `ai-service`, `backend`, `frontend`; Volumes: `mongo-data`, `rag-vector-store` | Used for staging and production containerized deployments. | Connected |
| `README.md` | Markdown | Comprehensive primary human-readable system architecture and setup guide. | Markdown documentation of architecture, credentials, testing, API structure. | N/A (Documentation) | Active |
| `start-all.bat` | Batch Script | Windows shell shortcut launching `node scripts/start-all.js`. | CLI launcher | Windows developer workflow. | Connected |
| `stop-all.bat` | Batch Script | Windows shell shortcut launching `node scripts/stop-all.js`. | CLI stopper | Windows developer workflow. | Connected |
| `scripts/start-all.js` | JavaScript | Cross-platform multi-process manager that detects port availability and concurrently launches backend, frontend, and AI service. | Process spawning, port checks (`3000, 5000, 8000, 5173`) | Invoked via `npm start` or `npm run dev`. | Connected |
| `scripts/stop-all.js` | JavaScript | Cross-platform utility that identifies listening processes on ports 5000, 5173, and 8000 and cleanly terminates them. | Process killer (`taskkill` on win32, `kill -9` on POSIX) | Invoked via `npm stop`. | Connected |
| `scripts/verify-live-e2e.js` | JavaScript | Comprehensive live integration verifier testing live endpoints, logins, QR generation, AI queries, and fee calculations. | End-to-end integration assertion script | Invoked via `npm run test:live`. | Connected |
| `scripts/test-profile-picture.js` | JavaScript | Verifies profile picture upload, magic-byte inspection, file storage, and avatar URL generation. | End-to-end avatar testing script | Invoked via `npm run test:avatar`. | Connected |
| `.github/workflows/ci.yml` | YAML | GitHub Actions Continuous Integration pipeline running automated testing matrix across Node.js 20/22 and Python 3.11. | 3 CI jobs: `backend-tests`, `ai-service-tests`, `frontend-build` | Triggered on Git push/PR to master, main, develop. | Connected |

---

## 3. Backend Gateway Files (`backend/`)

### Configuration & Entrypoint
| File Path | Type | Responsibility & Purpose | Key Exports / Definitions | Upstream Dependencies / Callers | Status |
|---|---|---|---|---|---|
| `backend/server.js` | CommonJS | Express server bootstrap, middleware registration, route mounting, health endpoints, graceful shutdown. | `app` (Express application) | Root `start-all.js`, Docker, CI `supertest`. | Connected |
| `backend/config/database.js` | CommonJS | Mongoose singleton database connection manager with reconnect logic and status telemetry. | `connectDB()`, `getDbStatus()`, `disconnectDB()` | Imported by `server.js`, test suites, seeders. | Connected |
| `backend/config/envValidator.js` | CommonJS | Inspects process environment variables at startup and halts execution if critical secrets are malformed. | `validateEnv()` | Called during `server.js` startup sequence. | Connected |
| `backend/package.json` | JSON | Node.js backend package manifest declaring Express, Mongoose, Helmet, Multer, etc. | Scripts: `start`, `dev`, `test`, `seed`, `backup`, `restore` | `npm` CLI, Docker, CI. | Connected |

### Middleware & Validators
| File Path | Type | Responsibility & Purpose | Key Exports / Definitions | Upstream Dependencies / Callers | Status |
|---|---|---|---|---|---|
| `backend/middleware/authenticate.js` | CommonJS | Extracts JWT from `Authorization: Bearer` header or cookies, verifies signature, and attaches user to `req.user`. | `authenticate` (Express middleware) | Mounted across all protected routes. | Connected |
| `backend/middleware/authorize.js` | CommonJS | Role-based authorization middleware verifying if `req.user.role` matches allowed roles (`admin`, `faculty`, `student`). | `authorize(...roles)` | Protects role-gated endpoints in routers. | Connected |
| `backend/middleware/errorHandler.js` | CommonJS | Centralized 404 handler and unified error response formatter. Masks stack traces in production. | `notFound`, `errorHandler` | Registered at bottom of `backend/server.js`. | Connected |
| `backend/middleware/uploadMiddleware.js` | CommonJS | Multer storage engine with MIME validation, 10MB limits, and file magic-byte inspection for JPEG, PNG, PDF. | `uploadAvatar`, `uploadMaterial`, `uploadReceipt` | Used in `userRoutes`, `resourceRoutes`, `feeRoutes`. | Connected |
| `backend/validators/authValidators.js` | CommonJS | Input sanity validators for user registration and login payloads (email format, password strength). | `validateRegister`, `validateLogin` | Mounted in `authRoutes.js`. | Connected |

### Domain Models (`backend/models/`)
| File Path | Type | Responsibility & Schema Definition | Key Exports | Callers & Usage | Status |
|---|---|---|---|---|---|
| `backend/models/User.js` | CommonJS | Core identity schema: `name`, `email`, `password` (bcrypt hash), `role`, `department`, `avatar`, `isActive`. | `User` (Mongoose Model) | `authController`, `userController`, `CampusModels`. | Connected |
| `backend/models/Department.js` | CommonJS | Academic department schema: `name`, `code`, `headOfDepartment` (ref User), `description`. | `Department` (Mongoose Model) | `departmentController`, `CampusModels`. | Connected |
| `backend/models/Course.js` | CommonJS | Academic degree/program: `name`, `code`, `department`, `durationSemesters`, `creditsRequired`. | `Course` (Mongoose Model) | `courseController`, `CampusModels`. | Connected |
| `backend/models/Subject.js` | CommonJS | Course subjects/modules: `name`, `code`, `courseCode`, `semester`, `credits`, `faculty` (ref User). | `Subject` (Mongoose Model) | `courseController`, `CampusModels`. | Connected |
| `backend/models/StudentProfile.js` | CommonJS | Extended student info: `user` (ref User), `rollNumber`, `semester`, `batch`, `academicStatus`, `guardian`. | `StudentProfile` (Mongoose Model) | `studentController`, `CampusModels`. | Connected |
| `backend/models/FacultyProfile.js` | CommonJS | Extended faculty info: `user` (ref User), `employeeId`, `designation`, `qualifications`, `officeHours`. | `FacultyProfile` (Mongoose Model) | `facultyController`, `CampusModels`. | Connected |
| `backend/models/Attendance.js` | CommonJS | Individual student attendance log: `student`, `subject`, `date`, `status` (`Present`/`Absent`/`Late`), `session`. | `Attendance` (Mongoose Model) | `attendanceController`, `CampusModels`. | Connected |
| `backend/models/AttendanceSession.js` | CommonJS | Active classroom session with generated rotating QR code, expiry window, and geofence tokens. | `AttendanceSession` (Mongoose Model) | `qrAttendanceController`, `CampusModels`. | Connected |
| `backend/models/TimetableEntry.js` | CommonJS | Class schedule slots: `courseCode`, `semester`, `subject`, `faculty`, `dayOfWeek`, `startTime`, `room`. | `TimetableEntry` (Mongoose Model) | `timetableController`, `CampusModels`. | Connected |
| `backend/models/Assignment.js` | CommonJS | Coursework and submissions: `title`, `subject`, `dueDate`, `totalMarks`, `submissions` array. | `Assignment` (Mongoose Model) | `assignmentController`, `CampusModels`. | Connected |
| `backend/models/Examination.js` | CommonJS | Exam timetable and schedules: `name`, `courseCode`, `semester`, `examType`, `schedules` array. | `Examination` (Mongoose Model) | `examController`, `CampusModels`. | Connected |
| `backend/models/Result.js` | CommonJS | Graded performance records: `student`, `examination`, `subject`, `marksObtained`, `maxMarks`, `grade`. | `Result` (Mongoose Model) | `examController`, `CampusModels`. | Connected |
| `backend/models/FeeRecord.js` | CommonJS | Student fee invoice ledger: `student`, `feeType`, `semester`, `totalAmount`, `paidAmount`, `balanceAmount`, `status`. | `FeeRecord` (Mongoose Model) | `feeController`, `CampusModels`. | Connected |
| `backend/models/FeeStructure.js` | CommonJS | Configurable academic fee structures: `title`, `courseCode`, `totalAnnualFee`, `components`, `status`. | `FeeStructure` (Mongoose Model) | `feeStructureController`, `CampusModels`. | Connected |
| `backend/models/PaymentTransaction.js` | CommonJS | Payment transaction logs: `student`, `orderId`, `paymentId`, `amount`, `paymentMethod`, `status`. | `PaymentTransaction` (Mongoose Model) | `feeController`, `paymentService`. | Connected |
| `backend/models/Notice.js` | CommonJS | Campus announcements: `title`, `content`, `category`, `priority`, `targetAudience`, `author`, `expiresAt`. | `Notice` (Mongoose Model) | `noticeController`, `CampusModels`. | Connected |
| `backend/models/Resource.js` | CommonJS | Uploaded academic materials: `title`, `subjectCode`, `fileUrl`, `fileType`, `ragIndexed`, `chunkCount`. | `Resource` (Mongoose Model) | `resourceController`, `ragService`. | Connected |
| `backend/models/Notification.js` | CommonJS | In-app user alerts: `recipient`, `title`, `message`, `type`, `read`, `link`. | `Notification` (Mongoose Model) | `notificationController`, `CampusModels`. | Connected |
| `backend/models/AuditLog.js` | CommonJS | System security audit trail: `actor`, `action`, `targetModel`, `targetId`, `details`, `ipAddress`. | `AuditLog` (Mongoose Model) | `analyticsController`, `userController`. | Connected |
| `backend/models/RegistrationRequest.js` | CommonJS | Public student/faculty registration applications pending administrator review: `status`, `reviewedBy`. | `RegistrationRequest` (Mongoose Model) | `registrationController`, `CampusModels`. | Connected |
| `backend/models/AIQueryLog.js` | CommonJS | Logs AI queries and student assistant interactions: `user`, `query`, `responseLength`, `latencyMs`. | `AIQueryLog` (Mongoose Model) | `aiController`, `CampusModels`. | Connected |
| `backend/models/CampusModels.js` | CommonJS | Central aggregator re-exporting all 21 models and default avatar constants for backwards compatibility. | All Models + `DEFAULT_AVATAR_URL` | Used across controllers and seed scripts. | Connected |

### Controllers (`backend/controllers/`)
| File Path | Type | Responsibility & Handlers | Key Dependencies | Status |
|---|---|---|---|---|
| `backend/controllers/authController.js` | CommonJS | User registration, login, JWT issuance, cookie handling, password reset, and identity resolution. | `User`, `StudentProfile`, `FacultyProfile`, `jwt`, `bcryptjs` | Connected |
| `backend/controllers/userController.js` | CommonJS | Profile retrieval, user updates, profile picture upload and deletion with avatar persistence. | `User`, `uploadMiddleware`, `fs` | Connected |
| `backend/controllers/studentController.js` | CommonJS | CRUD operations for student directory, profile lookups, semester queries, enrollment status. | `User`, `StudentProfile` | Connected |
| `backend/controllers/facultyController.js` | CommonJS | Directory lookups for academic faculty, assigned departments, and staff management. | `User`, `FacultyProfile` | Connected |
| `backend/controllers/departmentController.js` | CommonJS | Academic department creation, modification, head of department assignment, and listings. | `Department`, `User` | Connected |
| `backend/controllers/courseController.js` | CommonJS | Degree program and subject curriculum management, credit allocation, semester syllabus. | `Course`, `Subject` | Connected |
| `backend/controllers/attendanceController.js` | CommonJS | Traditional manual attendance recording, attendance stats aggregation, and student summaries. | `Attendance`, `Subject`, `StudentProfile` | Connected |
| `backend/controllers/qrAttendanceController.js` | CommonJS | Generates short-lived dynamic QR sessions for classrooms and validates student scan claims. | `AttendanceSession`, `Attendance`, `qrcode` | Connected |
| `backend/controllers/timetableController.js` | CommonJS | Timetable slot creation, daily routine queries, classroom and faculty conflict detection. | `TimetableEntry`, `Course`, `Subject` | Connected |
| `backend/controllers/assignmentController.js` | CommonJS | Assignment publishing, student file submissions, deadline enforcement, and grade recording. | `Assignment`, `Subject` | Connected |
| `backend/controllers/examController.js` | CommonJS | Examination schedule creation, score entry by faculty, and transcript/GPA calculation for students. | `Examination`, `Result`, `Subject` | Connected |
| `backend/controllers/feeController.js` | CommonJS | Student fee queries, Razorpay order creation, payment verification, webhook handling, offline payments. | `FeeRecord`, `PaymentTransaction`, `paymentService` | Connected |
| `backend/controllers/feeStructureController.js` | CommonJS | Course fee structure definition, version control, publishing, and bulk assignment to students. | `FeeStructure`, `Course`, `FeeRecord` | Connected |
| `backend/controllers/noticeController.js` | CommonJS | Campus bulletin board notices, audience targeting (all/student/faculty), expiration dates. | `Notice` | Connected |
| `backend/controllers/notificationController.js` | CommonJS | In-app user notifications, unread counts, mark-as-read toggles, and alert dispatch. | `Notification` | Connected |
| `backend/controllers/resourceController.js` | CommonJS | Study resource uploads (PDF/Docs), file downloads, automated triggering of AI RAG indexing. | `Resource`, `ragService` | Connected |
| `backend/controllers/dashboardController.js` | CommonJS | High-performance consolidated dashboard telemetry aggregators for Student, Faculty, and Admin. | Multiple Models (Attendance, Fees, Notices) | Connected |
| `backend/controllers/analyticsController.js` | CommonJS | Cross-institutional academic metrics, attendance charts, financial collection summaries, audit logs. | `AuditLog`, `Attendance`, `FeeRecord`, `Result` | Connected |
| `backend/controllers/aiController.js` | CommonJS | Gateway proxying student assistant prompts, risk predictions, and RAG document queries to AI service. | `aiService`, `ragService`, `AIQueryLog` | Connected |
| `backend/controllers/registrationController.js` | CommonJS | Admin management of pending public user registration requests (approval, rejection, role provisioning). | `RegistrationRequest`, `User`, `StudentProfile` | Connected |

### Routes (`backend/routes/`)
| File Path | Mounted At | Responsibility | Handlers & Controller Mapping | Status |
|---|---|---|---|---|
| `backend/routes/authRoutes.js` | `/api/auth` | Authentication endpoints: `/register`, `/login`, `/logout`, `/me`, `/registration-status`. | `authController`, `registrationController` | Connected |
| `backend/routes/userRoutes.js` | `/api/users` | User management & avatar: `/me`, `/me/profile-picture`, `/`. | `userController` | Connected |
| `backend/routes/studentRoutes.js` | `/api/students` | Student directory CRUD: `/`, `/:id`. | `studentController` | Connected |
| `backend/routes/facultyRoutes.js` | `/api/faculty` | Faculty directory CRUD: `/`, `/:id`. | `facultyController` | Connected |
| `backend/routes/departmentRoutes.js` | `/api/departments` | Department CRUD: `/`, `/:id`. | `departmentController` | Connected |
| `backend/routes/courseRoutes.js` | `/api` | Programs & subjects: `/courses`, `/courses/:id`, `/subjects`, `/subjects/:id`. | `courseController` | Connected |
| `backend/routes/attendanceRoutes.js` | `/api/attendance` | Attendance & QR: `/mark`, `/summary`, `/qr/create-session`, `/qr/scan`, `/qr/session/:id`. | `attendanceController`, `qrAttendanceController` | Connected |
| `backend/routes/timetableRoutes.js` | `/api/timetable` | Timetable slots: `/`, `/:id`. | `timetableController` | Connected |
| `backend/routes/assignmentRoutes.js` | `/api/assignments` | Assignment management: `/`, `/:id/submit`, `/:id/grade`. | `assignmentController` | Connected |
| `backend/routes/examRoutes.js` | `/api` | Exams & grades: `/examinations`, `/results/my`, `/results`. | `examController` | Connected |
| `backend/routes/feeRoutes.js` | `/api/fees` | Invoices, structures, payments: `/my`, `/structure`, `/order`, `/verify`, `/offline-pay`. | `feeController`, `feeStructureController` | Connected |
| `backend/routes/noticeRoutes.js` | `/api/notices` | Notice bulletin: `/`, `/:id`. | `noticeController` | Connected |
| `backend/routes/resourceRoutes.js` | `/api/resources` | Study materials: `/`, `/:id`, `/:id/reindex`, `/assistant/query`. | `resourceController` | Connected |
| `backend/routes/dashboardRoutes.js` | `/api/dashboard` | Role dashboards: `/student`, `/faculty`, `/admin`. | `dashboardController` | Connected |
| `backend/routes/analyticsRoutes.js` | `/api/analytics` | Analytics: `/admin/overview`, `/admin/audit-logs`, `/faculty/overview`, `/student/overview`. | `analyticsController` | Connected |
| `backend/routes/notificationRoutes.js` | `/api/notifications` | Alerts: `/`, `/unread-count`, `/:id/read`, `/read-all`. | `notificationController` | Connected |
| `backend/routes/aiRoutes.js` | `/api/ai` | AI endpoints: `/academic-insights`, `/recommendations`, `/chat`, `/document-assistant/query`. | `aiController` | Connected |
| `backend/routes/registrationRoutes.js` | `/api/admin/registration-requests` | Admin review: `/`, `/:id`, `/:id/approve`, `/:id/reject`, `/count/pending`. | `registrationController` | Connected |
| `backend/routes/academicRoutes.js` | `/api` | Legacy compatibility proxy forwarding legacy `/courses`, `/notices`, `/attendance/summary`. | Authoritative controllers | Connected |

### Services & Utilities (`backend/services/`, `backend/scripts/`)
| File Path | Type | Responsibility & Purpose | Key Functions | Status |
|---|---|---|---|---|
| `backend/services/aiService.js` | CommonJS | HTTP client communicating with Python FastAPI AI microservice with fallback heuristics. | `predictAcademicSupport()`, `getRecommendations()`, `chatAssistant()` | Connected |
| `backend/services/ragService.js` | CommonJS | Bridge transmitting study PDFs and text to AI service for chunking and vector storage. | `ingestDocumentToRAG()`, `queryAcademicDocumentsRAG()`, `deleteDocumentFromRAG()` | Connected |
| `backend/services/paymentService.js` | CommonJS | Razorpay SDK wrapper and cryptographic signature verification for online fee payments. | `createRazorpayOrder()`, `verifySignature()`, `processWebhookEvent()` | Connected |
| `backend/services/schedulerService.js` | CommonJS | Node-Cron scheduled background jobs (daily 02:00 attendance audit, daily 03:00 notice cleanup). | `initScheduler()` | Connected |
| `backend/scripts/seedDemoUsers.js` | CommonJS | Database seeder establishing administrative accounts, demo students, faculty, and departments. | `seedDemoUsers()` | Connected |
| `backend/scripts/backupDatabase.js` | CommonJS | Exports all Mongoose collections to timestamped JSON files in `backend/backups/`. | `runBackup()` | Connected |
| `backend/scripts/restoreDatabase.js` | CommonJS | Restores collection JSON dumps from `backend/backups/` into active MongoDB. | `runRestore()` | Connected |

### Backend Test Suites (`backend/tests/`)
| File Path | Framework | What It Tests | Coverage | Status |
|---|---|---|---|---|
| `backend/tests/api.test.js` | Jest / Supertest | Full-stack API integration: Auth, RBAC, Student/Faculty/Admin dashboards, Attendance, Timetable, Exams, AI gateway. | 47 integration tests | Passing |
| `backend/tests/feeManagement.test.js` | Jest / Supertest | Dynamic fee structure lifecycle: creation, versioning, publishing, assignment, ledger calculation. | Fee structure and billing logic | Passing |
| `backend/tests/payment.test.js` | Jest / Supertest | Payment gateway order generation, signature verification, balance calculation, offline cash payments. | Payment workflows | Passing |
| `backend/tests/registration.test.js` | Jest / Supertest | Public registration submission, pending review, administrator approval, role activation, rejection. | Registration requests | Passing |

---

## 4. Frontend Client Files (`client/`)

### Application Entrypoints & Tooling
| File Path | Type | Responsibility & Purpose | Key Exports / Elements | Status |
|---|---|---|---|---|
| `client/index.html` | HTML | HTML5 shell, viewport declarations, Google Fonts, and `#root` mounting element. | HTML Document | Connected |
| `client/src/main.jsx` | React JSX | React 18 application entrypoint initializing `BrowserRouter`, `AuthProvider`, `ThemeProvider`. | DOM Render | Connected |
| `client/src/App.jsx` | React JSX | Top-level router configuring public routes, protected role routes, root redirects, and 404 fallback. | `App` Component | Connected |
| `client/src/index.css` | CSS | Global Tailwind directives, scrollbar styling, midnight color tokens, and font smoothing. | Tailwind Directives | Connected |
| `client/src/services/api.js` | JavaScript | Axios singleton configured with baseURL `/api`, Bearer token interceptor, and unified error handling. | `api` (Axios instance) | Connected |
| `client/vite.config.js` | JavaScript | Vite configuration with React plugin, HTTPS SAN server settings, proxy rules, and vendor chunking. | Vite Config | Connected |
| `client/tailwind.config.js` | JavaScript | Tailwind theme extension: midnight dark palette (`#0B132B`, `#1C2541`), border radii, animations. | Tailwind Config | Connected |
| `client/nginx.conf` | Nginx Config | Production Nginx container configuration routing SPA paths to `index.html` and proxying `/api` to backend. | Nginx Server Block | Connected |

### Shared Components & Contexts (`client/src/components/`, `client/src/context/`)
| File Path | Type | Responsibility | Key Exports | Status |
|---|---|---|---|---|
| `client/src/context/AuthContext.jsx` | React Context | Manages user authentication state, token storage in localStorage/cookies, login, logout, and role inspection. | `AuthProvider`, `useAuth()` | Connected |
| `client/src/context/ThemeContext.jsx` | React Context | Manages dark/light theme switching, persists user theme in localStorage, synchronizes `dark` class on `<html>`. | `ThemeProvider`, `useTheme()` | Connected |
| `client/src/components/ProtectedRoute.jsx` | React Component | Route guard inspecting `isAuthenticated` and checking `user.role` against `allowedRoles`. Redirects to login or unauthorized. | `ProtectedRoute` | Connected |
| `client/src/components/DashboardLayout.jsx` | React Component | Main responsive shell wrapping dashboard pages with collapsible Sidebar, top Navbar, and content container. | `DashboardLayout` | Connected |
| `client/src/components/Navbar.jsx` | React Component | Top header with university branding, user role pill, theme toggle, notifications dropdown, and profile menu. | `Navbar` | Connected |
| `client/src/components/Sidebar.jsx` | React Component | Persistent navigation sidebar with role-specific menu links for Student, Faculty, and Admin. | `Sidebar` | Connected |
| `client/src/components/StatCard.jsx` | React Component | Metric display card featuring numeric KPIs, trend badges, icons, and subtle gradient backgrounds. | `StatCard` | Connected |
| `client/src/components/LoadingSkeleton.jsx` | React Component | Animated placeholder skeleton indicating loading state across cards and tables. | `LoadingSkeleton` | Connected |
| `client/src/components/ErrorBoundary.jsx` | React Component | React class error boundary preventing complete UI crashes on unhandled render errors. | `ErrorBoundary` | Connected |
| `client/src/components/ProfilePictureModal.jsx` | React Component | Modal dialog allowing users to upload or snap profile pictures with live canvas camera capture. | `ProfilePictureModal` | Connected |
| `client/src/components/SmartCampusLogo.jsx` | React Component | Scalable university brand logo rendered in full or compact variants with dark mode styling. | `SmartCampusLogo` | Connected |

### Application Pages (`client/src/pages/`)
| File Path | Role | Route URL | Purpose & Implemented Features | Status |
|---|---|---|---|---|
| `client/src/pages/LandingPage.jsx` | Public | `/` | Showcase landing page with campus overview, key feature highlights, and portal login links. | Verified |
| `client/src/pages/LoginPage.jsx` | Public | `/login` | Authentication form with role selector, email/password validation, and demo credential pre-fill. | Verified |
| `client/src/pages/RegisterPage.jsx` | Public | `/register` | Public registration request form for prospective students and faculty pending admin approval. | Verified |
| `client/src/pages/UnauthorizedPage.jsx` | Shared | `/unauthorized` | 403 Forbidden page displayed when a user attempts to access an unauthorized role route. | Verified |
| `client/src/pages/NotFoundPage.jsx` | Shared | `*` | 404 Not Found error page with navigation buttons to return to the active dashboard. | Verified |
| `client/src/pages/ProfilePage.jsx` | Universal | `/profile` | User profile details, password update form, and interactive profile avatar management. | Verified |
| `client/src/pages/StudentDashboard.jsx` | Student | `/student/dashboard` | Student hub: attendance percentage, CGPA, class schedule preview, recent notices, pending fees. | Verified |
| `client/src/pages/StudentCoursesPage.jsx` | Student | `/student/courses` | Enrolled degree courses, subject syllabus breakdown, credit distribution, faculty contacts. | Verified |
| `client/src/pages/StudentAttendancePage.jsx` | Student | `/student/attendance` | Attendance statistics, monthly calendar, and dynamic QR code scanner for classroom check-in. | Verified |
| `client/src/pages/StudentTimetablePage.jsx` | Student | `/student/timetable` | Weekly classroom schedule routine, room numbers, lecture timings, and faculty details. | Verified |
| `client/src/pages/StudentAssignmentsPage.jsx` | Student | `/student/assignments` | Coursework listing, submission status, file upload form, and faculty remarks/grades. | Verified |
| `client/src/pages/StudentResultsPage.jsx` | Student | `/student/results` | Semester terminal examination results, subject-wise marks, credit GPA, and transcript view. | Verified |
| `client/src/pages/StudentFeesPage.jsx` | Student | `/student/fees` | Academic fee structure, installment milestones, Razorpay online checkout, offline remittance info. | Verified |
| `client/src/pages/StudentResourcesPage.jsx` | Student | `/student/resources` | Course lecture notes, syllabi, reading materials with instant search and download links. | Verified |
| `client/src/pages/StudentAIPage.jsx` | Student | `/student/ai-assistant` | AI conversational campus assistant, RAG document query engine with citations, study recommendations. | Verified |
| `client/src/pages/StudentNoticesPage.jsx` | Student | `/student/notices` | University announcements, circulars, exam notices, holiday alerts, and filtering. | Verified |
| `client/src/pages/FacultyDashboard.jsx` | Faculty | `/faculty/dashboard` | Faculty overview: assigned classes, student attendance rate, upcoming lectures, assignment counts. | Verified |
| `client/src/pages/FacultyClassesPage.jsx` | Faculty | `/faculty/classes` | Directory of assigned academic courses, enrolled student rosters, and contact lists. | Verified |
| `client/src/pages/FacultyAttendancePage.jsx` | Faculty | `/faculty/attendance` | Attendance management: manual classroom roll-call and dynamic QR code session generation. | Verified |
| `client/src/pages/FacultyAssignmentsPage.jsx` | Faculty | `/faculty/assignments` | Assignment creation form, submission review table, and scoring interface. | Verified |
| `client/src/pages/FacultyPerformancePage.jsx` | Faculty | `/faculty/performance` | Class academic performance charts, grade distribution, and AI student risk early-warning list. | Verified |
| `client/src/pages/FacultyMaterialsPage.jsx` | Faculty | `/faculty/materials` | Study material and syllabus upload form triggering automated AI vector indexing. | Verified |
| `client/src/pages/FacultyNoticesPage.jsx` | Faculty | `/faculty/notices` | Departmental notice publishing form with target audience selection and expiration dates. | Verified |
| `client/src/pages/AdminDashboard.jsx` | Admin | `/admin/dashboard` | University executive KPI dashboard: total enrollment, faculty count, fee collection, attendance. | Verified |
| `client/src/pages/AdminRegistrationsPage.jsx` | Admin | `/admin/registrations` | Review interface for pending student and faculty public registration requests. | Verified |
| `client/src/pages/AdminStudentsPage.jsx` | Admin | `/admin/students` | Comprehensive student directory: search, filter by department, profile editing, and removal. | Verified |
| `client/src/pages/AdminFacultyPage.jsx` | Admin | `/admin/faculty` | Faculty staff directory: employee records, departmental assignments, and credential management. | Verified |
| `client/src/pages/AdminDepartmentsPage.jsx` | Admin | `/admin/departments` | Academic department governance: adding departments, editing codes, assigning department heads. | Verified |
| `client/src/pages/AdminCoursesPage.jsx` | Admin | `/admin/courses` | Degree program and subject administration: syllabus definition, credit points, semester setup. | Verified |
| `client/src/pages/AdminTimetablePage.jsx` | Admin | `/admin/timetable` | Institutional class schedule builder: slot assignment, classroom allocation, conflict checks. | Verified |
| `client/src/pages/AdminAttendancePage.jsx` | Admin | `/admin/attendance` | Cross-campus attendance reports, departmental compliance metrics, low attendance alerts. | Verified |
| `client/src/pages/AdminFeesPage.jsx` | Admin | `/admin/fees` | Dynamic fee structure designer, student invoice generation, offline cash payment recording. | Verified |
| `client/src/pages/AdminNoticesPage.jsx` | Admin | `/admin/notices` | Campus-wide announcement broadcasting, pinned announcements, and circular moderation. | Verified |
| `client/src/pages/AdminAnalyticsPage.jsx` | Admin | `/admin/analytics` | Deep institutional analytics: enrollment trends, grade distributions, financial collections. | Verified |
| `client/src/pages/AdminSettingsPage.jsx` | Admin | `/admin/settings` | System telemetry, database status, AI microservice health, security controls, and audit log viewer. | Verified |

---

## 5. AI & ML Microservice Files (`ai-service/`)

| File Path | Type | Responsibility & Purpose | Key Functions / Classes | Status |
|---|---|---|---|---|
| `ai-service/main.py` | Python | Microservice root entrypoint delegating to `app.main:app`. | Uvicorn execution | Connected |
| `ai-service/app/main.py` | Python | FastAPI application factory, CORS setup, lifespan startup ML model auto-training and loading. | `app`, `lifespan()` | Connected |
| `ai-service/app/config.py` | Python | Configuration variables: ports, secret keys (`INTERNAL_API_KEY`), model paths, Ollama settings. | `HOST`, `PORT`, `INTERNAL_API_KEY`, `MODEL_PATH` | Connected |
| `ai-service/app/schemas.py` | Python | Pydantic v2 data models for request validation and response serialization across all endpoints. | `StudentMetrics`, `PredictionResult`, `RAGIngestRequest`, `RAGQueryRequest` | Connected |
| `ai-service/app/api/routes.py` | Python | FastAPI router exposing endpoints for ML prediction, recommendations, assistant chat, RAG. | `predict_academic_support()`, `ingest_document()`, `query_academic_documents()` | Connected |
| `ai-service/app/ml/pipeline.py` | Python | Scikit-learn Random Forest model wrapper: training, artifact persistence, inference, feature importance. | `train_support_model()`, `evaluate_student_risk()`, `get_loaded_model()` | Connected |
| `ai-service/app/ml/synthetic_data.py` | Python | Synthetic university student academic dataset generator used for training and testing. | `generate_synthetic_student_data()` | Connected |
| `ai-service/app/ml/train.py` | Python | Standalone CLI script to trigger model re-training and evaluate classification metrics. | Training execution | Connected |
| `ai-service/app/services/assistant.py` | Python | Role-aware AI campus assistant response engine combining rule templates, context, and LLM bridges. | `generate_campus_response()` | Connected |
| `ai-service/app/services/recommender.py` | Python | Personalized learning recommendation engine suggesting study modules based on weak subjects. | `generate_learning_recommendations()` | Connected |
| `ai-service/app/rag/text_extractor.py` | Python | PyPDF text extractor extracting text page-by-page while rejecting unextractable/scanned PDFs. | `extract_text_from_pdf()`, `extract_text_from_string()` | Connected |
| `ai-service/app/rag/chunker.py` | Python | Sliding-window text chunker generating overlapping passages (500 chars, 100 char overlap) with metadata. | `create_chunks()` | Connected |
| `ai-service/app/rag/vector_store.py` | Python | Persistent vector storage using Scikit-Learn TF-IDF vectorizer and cosine similarity matrix. | `VectorStore`, `get_vector_store()` | Connected |
| `ai-service/app/rag/generator.py` | Python | Grounded answer generation incorporating prompt-injection defenses and verifiable page citations. | `generate_rag_answer()` | Connected |
| `ai-service/tests/test_ml_pipeline.py` | Pytest | Automated test suite validating ML pipeline training, risk classification, and feature scoring. | 4 unit tests | Passing |
| `ai-service/tests/test_rag_pipeline.py` | Pytest | Automated test suite validating PDF parsing, chunking, vector indexing, retrieval, and citations. | 5 integration tests | Passing |
| `ai-service/tests/test_recommendations.py` | Pytest | Automated test suite validating student gap analysis, curriculum recommendations, and assistant prompts. | 3 unit tests | Passing |

---

## 6. Disconnected, Redundant or Orphaned Files Discovered

During repository inspection, the following non-application and secondary artifacts were identified:
1. `welcome-to-docker/` (Cleaned in prior commits): An orphaned default Docker Desktop starter template completely unconnected to the SmartCampus AI codebase.
2. `temp_prompt.txt`: A local developer scratch file stored in the root directory containing previous user instructions. Does not affect application runtime.
3. `SMARTCAMPUS_READ_ONLY_AUDIT_REPORT_20261018_0130.md`: Historical audit report in root, preserved in accordance with non-destructive documentation rules.

