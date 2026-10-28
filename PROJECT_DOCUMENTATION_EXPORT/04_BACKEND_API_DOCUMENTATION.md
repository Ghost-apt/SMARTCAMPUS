# SmartCampus AI — Backend Gateway & Complete API Reference

**Document ID:** `04_BACKEND_API_DOCUMENTATION`  
**Version:** 6.0.0  
**Generated Date:** 2026-10-28  
**Repository Working Directory:** `/Users/anurag93/Downloads/CodingZone/MajorProjects/SMARTCAMPUS/backend`  
**Classification:** Backend Technical Architecture & API Inventory  

---

## 1. Backend Server Architecture & Initialization Sequence

The SmartCampus AI backend gateway is built using **Node.js** and **Express 5.3.0**. It operates as the authoritative central controller, authentication authority, and API gateway connecting frontend clients, the MongoDB database, and the Python FastAPI AI microservice.

### 1.1 Startup Sequence (`backend/server.js`)
When `node backend/server.js` or `npm run dev` is initiated:
1. **Environment Configuration Loading:** Invokes `require('dotenv').config()`.
2. **Environment Validation:** Calls `validateEnv()` in `backend/config/envValidator.js` to ensure mandatory variables (`MONGODB_URI`, `JWT_SECRET`) satisfy entropy and connectivity standards. Halts process execution if critical secrets are missing in production.
3. **Security Headers & Preflights:**
   * `helmet()`: Sets standard HTTP security headers, disallows cross-origin resource leaks, and configures CSP.
   * `cors()`: Configures dynamic origin whitelisting allowing localhost, 127.0.0.1, private subnet IPs (`192.168.x.x`, `10.x.x.x`), and configured `CLIENT_ORIGIN` with `credentials: true`.
   * **Private Network Access (PNA):** Adds `Access-Control-Allow-Private-Network: true` headers on Chromium preflight requests.
4. **Rate Limiters:**
   * Global API limiter: 600 requests per 15-minute window.
   * Auth limiter: 40 attempts per 15-minute window.
   * AI limiter: 80 queries per 1-minute window.
   *(Note: Rate limiting is bypassed automatically when `NODE_ENV === 'test'`)*.
5. **Parsers & Static Assets:**
   * `express.json({ limit: '10mb' })` with `rawBody` verification buffer retention for payment webhook HMAC validation.
   * `express.urlencoded({ extended: true, limit: '10mb' })`.
   * `cookieParser()`.
   * Static asset directory `/uploads` mounted to serve uploaded user avatars, fee receipts, and course syllabus PDFs.
6. **Database Connection:** Invokes `connectDB()` in `backend/config/database.js` establishing the Mongoose connection pool.
7. **Task Scheduler:** In non-test environments, initializes `initScheduler()` in `backend/services/schedulerService.js`.
8. **Server Binding & Graceful Shutdown:** Binds to `process.env.PORT || 5000` and registers `SIGINT` / `SIGTERM` handlers for zero-downtime teardown.

---

## 2. Complete REST API Endpoint Inventory

The backend gateway registers **130+ distinct endpoint routes** mapped across 19 router modules and the core server.

### 2.1 System Telemetry & Health Probes (`server.js`)

| Method | Endpoint Path | Auth Required | Allowed Roles | Controller / Function | Purpose & Response Summary |
|---|---|---|---|---|---|
| `GET` | `/api` | Public | All | Inline | API root directory listing service endpoints and documentation status. |
| `GET` | `/api/health` | Public | All | Inline | Returns deep health telemetry (database state, memory RSS/heap, uptime, Node version). |
| `GET` | `/api/health/live` | Public | All | Inline | Docker / Kubernetes Liveness probe returning HTTP 200 `{ status: "alive" }`. |
| `GET` | `/api/health/ready` | Public | All | Inline | Docker / Kubernetes Readiness probe verifying active MongoDB connectivity. |
| `POST` | `/api/seed` | Public / Dev | All | `seedDemoUsers` | Seeds demo accounts, departments, courses, and fee structures into MongoDB. |

---

### 2.2 Authentication & User Identity (`/api/auth`, `/api/users`)

| Method | Endpoint Path | Auth Required | Allowed Roles | Handler Function | Request Body / Query | Frontend Consumer |
|---|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | All | `authController.register` | `{ name, email, password, role, department, rollNumber }` | `RegisterPage.jsx` |
| `POST` | `/api/auth/login` | Public | All | `authController.login` | `{ email, password, role }` | `LoginPage.jsx` |
| `POST` | `/api/auth/logout` | Public | All | `authController.logout` | None (Clears HTTP cookie) | `Sidebar.jsx`, `Navbar.jsx` |
| `GET` | `/api/auth/me` | Bearer JWT | All | `authController.getMe` | None | `AuthContext.jsx` |
| `GET` | `/api/auth/registration-status` | Public | All | `registrationController.getRegistrationStatus` | `?email=...` or `?requestId=...` | `RegisterPage.jsx` |
| `GET` | `/api/users/me` | Bearer JWT | All | `userController.getCurrentUser` | None | `ProfilePage.jsx` |
| `PATCH` | `/api/users/me` | Bearer JWT | All | `userController.updateCurrentUser` | `{ name, phone, bio, currentPassword, newPassword }` | `ProfilePage.jsx` |
| `POST` | `/api/users/me/profile-picture` | Bearer JWT | All | `userController.uploadProfilePicture` | `multipart/form-data` (`image` file) | `ProfilePictureModal.jsx` |
| `PATCH` | `/api/users/me/profile-picture` | Bearer JWT | All | `userController.uploadProfilePicture` | `multipart/form-data` (`image` file) | `ProfilePictureModal.jsx` |
| `DELETE` | `/api/users/me/profile-picture` | Bearer JWT | All | `userController.deleteProfilePicture` | None | `ProfilePage.jsx` |
| `GET` | `/api/users` | Bearer JWT | `admin` | `userController.getAllUsers` | `?role=...&department=...` | `AdminSettingsPage.jsx` |

---

### 2.3 Registration Requests Governance (`/api/admin/registration-requests`)

| Method | Endpoint Path | Auth Required | Allowed Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/admin/registration-requests` | Bearer JWT | `admin` | `getRegistrationRequests` | Lists pending, approved, or rejected public registrations. | `AdminRegistrationsPage.jsx` |
| `GET` | `/api/admin/registration-requests/count/pending` | Bearer JWT | `admin` | `getPendingCount` | Fast metric count of unreviewed student/faculty requests. | `Navbar.jsx`, `AdminDashboard.jsx` |
| `GET` | `/api/admin/registration-requests/:id` | Bearer JWT | `admin` | `getRegistrationRequestById` | Inspects full details and uploaded application docs. | `AdminRegistrationsPage.jsx` |
| `POST` / `PATCH` | `/api/admin/registration-requests/:id/approve` | Bearer JWT | `admin` | `approveRegistrationRequest` | Approves request, provisions `User` and `Profile`, sets active. | `AdminRegistrationsPage.jsx` |
| `POST` / `PATCH` | `/api/admin/registration-requests/:id/reject` | Bearer JWT | `admin` | `rejectRegistrationRequest` | Rejects application with review rejection reason. | `AdminRegistrationsPage.jsx` |

---

### 2.4 Directory Management: Students, Faculty & Departments (`/api/students`, `/api/faculty`, `/api/departments`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/students` | JWT | `admin`, `faculty` | `studentController.getStudents` | Lists enrolled students with pagination and department filters. | `AdminStudentsPage.jsx`, `FacultyClassesPage.jsx` |
| `GET` | `/api/students/:id` | JWT | `admin`, `faculty`, `student` | `studentController.getStudentById` | Retrieves individual student profile and academic standing. | `AdminStudentsPage.jsx` |
| `POST` | `/api/students` | JWT | `admin` | `studentController.createStudent` | Manually provisions a new student record and account. | `AdminStudentsPage.jsx` |
| `PATCH` | `/api/students/:id` | JWT | `admin` | `studentController.updateStudent` | Updates student enrollment, semester, or batch. | `AdminStudentsPage.jsx` |
| `DELETE` | `/api/students/:id` | JWT | `admin` | `studentController.deleteStudent` | Deactivates or removes student from university database. | `AdminStudentsPage.jsx` |
| `GET` | `/api/faculty` | JWT | `admin`, `faculty`, `student` | `facultyController.getFacultyList` | Directory of university professors, departments, designations. | `AdminFacultyPage.jsx`, `StudentCoursesPage.jsx` |
| `GET` | `/api/faculty/:id` | JWT | `admin`, `faculty` | `facultyController.getFacultyById` | Retrieves detailed faculty profile, courses taught, office hours. | `AdminFacultyPage.jsx` |
| `POST` | `/api/faculty` | JWT | `admin` | `facultyController.createFaculty` | Manually creates faculty employee record and account. | `AdminFacultyPage.jsx` |
| `PATCH` | `/api/faculty/:id` | JWT | `admin` | `facultyController.updateFaculty` | Updates faculty designation, office, or department. | `AdminFacultyPage.jsx` |
| `DELETE` | `/api/faculty/:id` | JWT | `admin` | `facultyController.deleteFaculty` | Deactivates faculty member account. | `AdminFacultyPage.jsx` |
| `GET` | `/api/departments` | Public / JWT | All | `departmentController.getDepartments` | Lists active academic departments (BCA, MCA, B.Tech, MBA). | `AdminDepartmentsPage.jsx`, `RegisterPage.jsx` |
| `GET` | `/api/departments/:id` | JWT | All | `departmentController.getDepartmentById` | Detailed department info including Head of Department. | `AdminDepartmentsPage.jsx` |
| `POST` | `/api/departments` | JWT | `admin` | `departmentController.createDepartment` | Creates a new academic department. | `AdminDepartmentsPage.jsx` |
| `PATCH` | `/api/departments/:id` | JWT | `admin` | `departmentController.updateDepartment` | Updates department title, code, or HOD assignment. | `AdminDepartmentsPage.jsx` |
| `DELETE` | `/api/departments/:id` | JWT | `admin` | `departmentController.deleteDepartment` | Removes department if no active students enrolled. | `AdminDepartmentsPage.jsx` |

---

### 2.5 Academic Programs, Courses & Subjects (`/api/courses`, `/api/subjects`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/courses` | JWT | All | `courseController.getCourses` | Lists degree programs with semester counts and credits. | `StudentCoursesPage.jsx`, `AdminCoursesPage.jsx` |
| `POST` | `/api/courses` | JWT | `admin` | `courseController.createCourse` | Adds a new degree program (e.g. Bachelor of Computer Applications). | `AdminCoursesPage.jsx` |
| `PATCH` | `/api/courses/:id` | JWT | `admin` | `courseController.updateCourse` | Modifies course parameters or credit requirements. | `AdminCoursesPage.jsx` |
| `DELETE` | `/api/courses/:id` | JWT | `admin` | `courseController.deleteCourse` | Deletes degree program record. | `AdminCoursesPage.jsx` |
| `GET` | `/api/subjects` | JWT | All | `courseController.getSubjects` | Lists individual course modules/subjects by semester. | `AdminCoursesPage.jsx`, `FacultyClassesPage.jsx` |
| `POST` | `/api/subjects` | JWT | `admin`, `faculty` | `courseController.createSubject` | Registers new subject module with syllabus and credit weight. | `AdminCoursesPage.jsx` |
| `PATCH` | `/api/subjects/:id` | JWT | `admin`, `faculty` | `courseController.updateSubject` | Updates subject code, title, or assigned lecturer. | `AdminCoursesPage.jsx` |

---

### 2.6 Attendance & Dynamic QR Check-in (`/api/attendance`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/attendance/summary` | JWT | `student`, `admin` | `attendanceController.getAttendanceSummary` | Computes student overall attendance percentage, subject stats. | `StudentAttendancePage.jsx`, `StudentDashboard.jsx` |
| `POST` | `/api/attendance/mark` | JWT | `faculty`, `admin` | `attendanceController.markAttendance` | Traditional roll-call batch attendance recording. | `FacultyAttendancePage.jsx` |
| `POST` | `/api/attendance/qr/create-session` | JWT | `faculty`, `admin` | `qrAttendanceController.createQRSession` | Generates a 5-15 minute rotating QR token session for a class. | `FacultyAttendancePage.jsx` |
| `POST` | `/api/attendance/qr/scan` | JWT | `student` | `qrAttendanceController.scanQRCode` | Validates scanned student token and marks student present. | `StudentAttendancePage.jsx` |
| `GET` | `/api/attendance/qr/session/:id` | JWT | `faculty`, `admin` | `qrAttendanceController.getSessionStatus` | Real-time polling of students checked into active QR session. | `FacultyAttendancePage.jsx` |

---

### 2.7 Timetable & Class Routine (`/api/timetable`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/timetable` | JWT | All | `timetableController.getTimetable` | Queries weekly schedule slots filtered by courseCode & semester. | `StudentTimetablePage.jsx`, `AdminTimetablePage.jsx` |
| `GET` | `/api/timetable/today` | JWT | All | `timetableController.getTodayClasses` | Returns active day's lectures, room numbers, and timings. | `StudentDashboard.jsx`, `FacultyDashboard.jsx` |
| `POST` | `/api/timetable` | JWT | `admin` | `timetableController.createEntry` | Inserts classroom routine slot with faculty clash validation. | `AdminTimetablePage.jsx` |
| `DELETE` | `/api/timetable/:id` | JWT | `admin` | `timetableController.deleteEntry` | Removes timetable schedule slot. | `AdminTimetablePage.jsx` |

---

### 2.8 Assignments & Coursework (`/api/assignments`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/assignments` | JWT | All | `assignmentController.getAssignments` | Lists coursework assignments with deadlines and submission stats. | `StudentAssignmentsPage.jsx`, `FacultyAssignmentsPage.jsx` |
| `POST` | `/api/assignments` | JWT | `faculty`, `admin` | `assignmentController.createAssignment` | Publishes new assignment with prompt instructions and due date. | `FacultyAssignmentsPage.jsx` |
| `POST` | `/api/assignments/:id/submit` | JWT | `student` | `assignmentController.submitAssignment` | Records student submission with text content or file URL. | `StudentAssignmentsPage.jsx` |
| `POST` | `/api/assignments/:id/grade` | JWT | `faculty`, `admin` | `assignmentController.gradeSubmission` | Assigns marks and feedback comments to student submission. | `FacultyAssignmentsPage.jsx` |

---

### 2.9 Examinations, GPA & Results (`/api/examinations`, `/api/results`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/examinations` | JWT | All | `examController.getExaminations` | Retrieves upcoming mid-term and end-term exam schedules. | `StudentResultsPage.jsx` |
| `POST` | `/api/examinations` | JWT | `admin`, `faculty` | `examController.createExamination` | Schedules exam timetable, dates, hall allocations. | `AdminSettingsPage.jsx` |
| `GET` | `/api/results/my` | JWT | `student`, `admin` | `examController.getMyResults` | Computes student SGPA/CGPA, letter grades, subject scorecards. | `StudentResultsPage.jsx` |
| `POST` | `/api/results` | JWT | `faculty`, `admin` | `examController.enterResult` | Submits marks obtained by students in an examination. | `FacultyPerformancePage.jsx` |

---

### 2.10 Academic Fees, Invoices & Payments (`/api/fees`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/fees/my` | JWT | `student`, `admin` | `feeController.getMyFees` | Retrieves student invoice balance, total billed, amount paid. | `StudentFeesPage.jsx` |
| `GET` | `/api/fees/structure` | JWT | All | `feeController.getFeeStructure` | Official course fee breakdown (tuition, exam, lab, library). | `StudentFeesPage.jsx` |
| `GET` | `/api/fees/structures` | JWT | All | `feeStructureController.getFeeStructures` | Lists dynamic fee structures with versioning status. | `AdminFeesPage.jsx` |
| `POST` | `/api/fees/structures` | JWT | `admin` | `feeStructureController.createFeeStructure` | Creates dynamic fee structure blueprint. | `AdminFeesPage.jsx` |
| `POST` | `/api/fees/structures/:id/publish` | JWT | `admin` | `feeStructureController.publishFeeStructure` | Publishes fee structure and locks component items. | `AdminFeesPage.jsx` |
| `POST` | `/api/fees/structures/:id/assign` | JWT | `admin` | `feeStructureController.assignFeeStructureToStudents` | Generates student `FeeRecord` invoices from structure. | `AdminFeesPage.jsx` |
| `POST` | `/api/fees/order` | JWT | `student` | `feeController.createPaymentOrder` | Generates Razorpay checkout order for student payment. | `StudentFeesPage.jsx` |
| `POST` | `/api/fees/verify` | JWT | `student` | `feeController.verifyPayment` | Cryptographically verifies Razorpay signature and updates ledger. | `StudentFeesPage.jsx` |
| `POST` | `/api/fees/offline-pay` | JWT | `admin` | `feeController.recordOfflinePayment` | Records in-person cash/cheque payment with official receipt number. | `AdminFeesPage.jsx` |
| `GET` | `/api/fees` | JWT | `admin` | `feeController.getAllFees` | Institutional financial overview: receivables, collections, dues. | `AdminFeesPage.jsx` |
| `GET` | `/api/fees/transactions` | JWT | `admin` | `feeController.getAllTransactions` | Complete payment audit ledger across all payment methods. | `AdminFeesPage.jsx` |

---

### 2.11 AI Assistant, Machine Learning & RAG Services (`/api/ai`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `POST` | `/api/ai/chat` | RateLimited | All | `aiController.chatAssistantController` | Proxies student campus questions to AI service assistant. | `StudentAIPage.jsx` |
| `POST` | `/api/ai/document-assistant/query` | RateLimited | All | `aiController.queryDocumentAssistant` | Grounded RAG query over uploaded course notes/syllabi with citations. | `StudentAIPage.jsx` |
| `GET` | `/api/ai/recommendations` | JWT | `student` | `aiController.getStudentRecommendations` | Generates personalized study topic recommendations. | `StudentAIPage.jsx`, `StudentDashboard.jsx` |
| `GET` | `/api/ai/early-support` | JWT | `faculty`, `admin` | `aiController.getEarlySupportCohort` | Runs Random Forest risk model across student cohort. | `FacultyPerformancePage.jsx`, `AdminAnalyticsPage.jsx` |
| `GET` | `/api/ai/status` | JWT | `admin` | `aiController.getAIHealthStatus` | Reports AI microservice connection state and loaded ML version. | `AdminSettingsPage.jsx` |
| `POST` | `/api/ai/ml/retrain` | JWT | `admin` | `aiController.triggerModelRetrain` | Triggers retraining of the Random Forest model on disk. | `AdminSettingsPage.jsx` |
| `GET` | `/api/ai/rag/status` | JWT | `admin` | `aiController.getRAGCatalogStatus` | Vector store metrics: total documents indexed and chunk count. | `AdminSettingsPage.jsx` |

---

### 2.12 Bulletins, Resources, Analytics & Notifications (`/api/notices`, `/api/resources`, `/api/analytics`, `/api/notifications`)

| Method | Endpoint Path | Auth | Roles | Handler Function | Purpose | Frontend Consumer |
|---|---|---|---|---|---|---|
| `GET` | `/api/notices` | Public / JWT | All | `noticeController.getNotices` | Lists campus circulars, exam notices, holiday alerts. | `StudentNoticesPage.jsx`, `FacultyNoticesPage.jsx`, `AdminNoticesPage.jsx` |
| `POST` | `/api/notices` | JWT | `faculty`, `admin` | `noticeController.createNotice` | Publishes university notice with audience and priority targeting. | `FacultyNoticesPage.jsx`, `AdminNoticesPage.jsx` |
| `DELETE` | `/api/notices/:id` | JWT | `admin` | `noticeController.deleteNotice` | Removes notice circular. | `AdminNoticesPage.jsx` |
| `GET` | `/api/resources` | JWT | All | `resourceController.getResources` | Lists uploaded syllabi, lecture slides, study materials. | `StudentResourcesPage.jsx`, `FacultyMaterialsPage.jsx` |
| `POST` | `/api/resources` | JWT | `faculty`, `admin` | `resourceController.uploadResource` | Uploads PDF/Doc material and automatically triggers RAG vector indexing. | `FacultyMaterialsPage.jsx` |
| `POST` | `/api/resources/:id/reindex` | JWT | `faculty`, `admin` | `resourceController.reindexResource` | Forces re-extraction and re-vectorization of a study document. | `FacultyMaterialsPage.jsx` |
| `GET` | `/api/analytics/admin/overview` | JWT | `admin` | `analyticsController.getAdminOverview` | Aggregated campus metrics: attendance compliance, financial totals, grade curves. | `AdminAnalyticsPage.jsx`, `AdminDashboard.jsx` |
| `GET` | `/api/analytics/admin/audit-logs` | JWT | `admin` | `analyticsController.getAuditLogs` | Paginated system audit trails with actor, action, and IP tracking. | `AdminSettingsPage.jsx`, `AdminAnalyticsPage.jsx` |
| `GET` | `/api/notifications` | JWT | All | `notificationController.getNotifications` | Retrieves user's in-app notification alerts. | `Navbar.jsx` |
| `GET` | `/api/notifications/unread-count` | JWT | All | `notificationController.getUnreadCount` | Unread badge counter polled by the top navigation bar. | `Navbar.jsx` |
| `PATCH` | `/api/notifications/:id/read` | JWT | All | `notificationController.markAsRead` | Marks individual notification as read. | `Navbar.jsx` |
| `POST` | `/api/notifications/read-all` | JWT | All | `notificationController.markAllAsRead` | Clears all unread notifications for current user. | `Navbar.jsx` |

---

## 3. Discovered Endpoint Integration Observations

1. **Legacy Compatibility Router (`academicRoutes.js`):** `academicRoutes.js` delegates legacy routes (`/courses`, `/notices`, `/attendance/summary`, `/assignments`, `/ai/chat`) directly to the authoritative controllers (`courseController`, `noticeController`, `attendanceController`, `assignmentController`, `aiController`). This guarantees backwards compatibility with older client bundles without route shadowing.
2. **Dual Method Support on Registrations:** Both `POST` and `PATCH` are implemented on `/api/admin/registration-requests/:id/approve` and `/reject` to gracefully handle varying client HTTP conventions.
3. **Internal Key Shielding:** Endpoints communicating with the Python AI service forward the configured `INTERNAL_AI_KEY` in the `X-Internal-Key` header.

