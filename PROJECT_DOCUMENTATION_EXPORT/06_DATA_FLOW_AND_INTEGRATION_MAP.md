# SmartCampus AI — End-to-End Data Flow & Integration Map

**Document ID:** `06_DATA_FLOW_AND_INTEGRATION_MAP`  
**Version:** 6.0.0  
**Generated Date:** 2026-10-28  
**Repository Working Directory:** `/Users/anurag93/Downloads/CodingZone/MajorProjects/SMARTCAMPUS`  
**Classification:** System Integration Matrix & End-to-End Workflow Traces  

---

## 1. Architectural Data Flow Overview

Every user interaction in SmartCampus AI follows a deterministic, unidirectional multi-tier data pipeline:

$$\text{User Action} \longrightarrow \text{React Component} \longrightarrow \text{State Handler} \longrightarrow \text{Axios API Client} \longrightarrow \text{HTTP REST} \longrightarrow \text{Express Gateway} \longrightarrow \text{Middlewares (Auth/RBAC/RateLimit)} \longrightarrow \text{Controller} \longrightarrow \text{Downstream Service (Mongoose / FastAPI)} \longrightarrow \text{JSON Response} \longrightarrow \text{React State} \longrightarrow \text{Re-rendered UI}$$

---

## 2. Comprehensive Data-Flow Matrix

| Major Workflow | Frontend Component | API Endpoint | Middleware Stack | Controller / Service | Downstream Persistence / Engine | Status |
|---|---|---|---|---|---|---|
| **User Login** | `LoginPage.jsx` | `POST /api/auth/login` | `authLimiter`, `validateLogin` | `authController.login` | Queries `User`, verifies `bcrypt`, issues JWT | Verified Complete |
| **Registration Application** | `RegisterPage.jsx` | `POST /api/auth/register` | `authLimiter`, `validateRegister` | `authController.register` | Writes `RegistrationRequest` (status: pending) | Verified Complete |
| **Admin Registration Approval** | `AdminRegistrationsPage.jsx` | `POST /api/admin/registration-requests/:id/approve` | `authenticate`, `authorize('admin')` | `registrationController.approve` | Creates `User` + `StudentProfile`, marks approved | Verified Complete |
| **Profile Photo Upload** | `ProfilePictureModal.jsx` | `POST /api/users/me/profile-picture` | `authenticate`, `uploadAvatar` (Multer) | `userController.uploadProfilePicture` | Magic-byte checks, writes disk file, updates `User.avatar` | Verified Complete |
| **Student Timetable Lookup** | `StudentTimetablePage.jsx` | `GET /api/timetable` | `authenticate` | `timetableController.getTimetable` | Queries `TimetableEntry` populated with `Subject` | Verified Complete |
| **QR Session Generation** | `FacultyAttendancePage.jsx` | `POST /api/attendance/qr/create-session` | `authenticate`, `authorize('faculty')` | `qrAttendanceController.createSession` | Generates token, renders QR data URI, creates `AttendanceSession` | Verified Complete |
| **Student QR Check-in** | `StudentAttendancePage.jsx` | `POST /api/attendance/qr/scan` | `authenticate`, `authorize('student')` | `qrAttendanceController.scanQRCode` | Validates session expiration, writes `Attendance` record | Verified Complete |
| **Assignment Submission** | `StudentAssignmentsPage.jsx` | `POST /api/assignments/:id/submit` | `authenticate`, `authorize('student')` | `assignmentController.submit` | Pushes submission into `Assignment.submissions` array | Verified Complete |
| **Assignment Grading** | `FacultyAssignmentsPage.jsx` | `POST /api/assignments/:id/grade` | `authenticate`, `authorize('faculty')` | `assignmentController.grade` | Sets grade & feedback, issues `Notification` | Verified Complete |
| **Transcript GPA Inspection** | `StudentResultsPage.jsx` | `GET /api/results/my` | `authenticate`, `authorize('student')` | `examController.getMyResults` | Aggregates `Result` collection, calculates SGPA/CGPA | Verified Complete |
| **Fee Structure Definition** | `AdminFeesPage.jsx` | `POST /api/fees/structures` | `authenticate`, `authorize('admin')` | `feeStructureController.create` | Validates categories, saves `FeeStructure` (Draft) | Verified Complete |
| **Online Payment Checkout** | `StudentFeesPage.jsx` | `POST /api/fees/order` | `authenticate` | `feeController.createPaymentOrder` | Calls Razorpay SDK, writes `PaymentTransaction` | Verified Complete |
| **Payment Signature Verification** | `StudentFeesPage.jsx` | `POST /api/fees/verify` | `authenticate` | `feeController.verifyPayment` | HMAC-SHA256 signature check, credits `FeeRecord.paidAmount` | Verified Complete |
| **Offline Cash Payment Recording** | `AdminFeesPage.jsx` | `POST /api/fees/offline-pay` | `authenticate`, `authorize('admin')` | `feeController.recordOfflinePayment` | Creates `PaymentTransaction`, recalculates `FeeRecord` | Verified Complete |
| **Notice Publishing** | `FacultyNoticesPage.jsx` | `POST /api/notices` | `authenticate`, `authorize('faculty')` | `noticeController.createNotice` | Writes `Notice`, broadcasts `Notification` | Verified Complete |
| **Study Material Upload & RAG Index** | `FacultyMaterialsPage.jsx` | `POST /api/resources` | `authenticate`, `uploadMaterial` | `resourceController.upload` $\rightarrow$ `ragService` | Saves file, posts base64 to FastAPI `/rag/ingest`, chunks & vectors | Verified Complete |
| **Grounded Document Q&A (RAG)** | `StudentAIPage.jsx` | `POST /api/ai/document-assistant/query` | `aiLimiter`, `authenticate` | `aiController` $\rightarrow$ `ragService` | FastAPI `/rag/query`: TF-IDF cosine match, formats citations | Verified Complete |
| **Academic Early-Risk Analysis** | `FacultyPerformancePage.jsx` | `GET /api/ai/early-support` | `authenticate`, `authorize('faculty')` | `aiController` $\rightarrow$ `aiService` | Pulls class attendance/grades, FastAPI evaluates Random Forest | Verified Complete |
| **Personalized Recommendations** | `StudentAIPage.jsx` | `GET /api/ai/recommendations` | `authenticate` | `aiController` $\rightarrow$ `aiService` | FastAPI evaluates weak areas, returns curated library links | Verified Complete |
| **Automated Attendance Audit** | Background Node-Cron | Local Cron Trigger (Daily 02:00) | Server Internal | `schedulerService.initScheduler` | Queries non-compliant attendance, writes `AuditLog` | Verified Complete |
| **Database Backup** | `scripts/backupDatabase.js` | CLI Command (`npm run backup`) | Local Server Process | `runBackup()` | Dumps 21 Mongoose collections to timestamped JSON files | Verified Complete |

---

## 3. Detailed Sequence Diagrams for Critical Workflows

### 3.1 Authentication & Session Issuance Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Campus Member (Student/Faculty/Admin)
    participant Client as React Client (LoginPage.jsx)
    participant Gateway as Express Gateway (authRoutes.js)
    participant AuthCtrl as authController.js
    participant DB as MongoDB (User Collection)

    User->>Client: Enters credentials & clicks "Sign In"
    Client->>Gateway: POST /api/auth/login { email, password, role }
    Gateway->>Gateway: authLimiter checks IP rate limits
    Gateway->>AuthCtrl: Delegates to login()
    AuthCtrl->>DB: User.findOne({ email }).select('+password')
    DB-->>AuthCtrl: Returns User document
    AuthCtrl->>AuthCtrl: bcrypt.compare(password, user.password)
    alt Password Invalid
        AuthCtrl-->>Client: HTTP 401 { success: false, message: "Invalid credentials" }
        Client-->>User: Displays error notification
    else Password Valid
        AuthCtrl->>AuthCtrl: jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: '7d' })
        AuthCtrl-->>Client: HTTP 200 { success: true, token, user } + Set-Cookie
        Client->>Client: localStorage.setItem('smartcampus_token', token)
        Client->>Client: AuthContext.setUser(user)
        Client-->>User: Redirects to role dashboard (/student/dashboard)
    end
```

---

### 3.2 Dynamic QR Attendance Check-In Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty Member
    actor Student as Student Member
    participant FacUI as FacultyAttendancePage.jsx
    participant StuUI as StudentAttendancePage.jsx
    participant Gateway as Express Gateway (/api/attendance)
    participant QRCtrl as qrAttendanceController.js
    participant DB as MongoDB (Attendance & Sessions)

    Faculty->>FacUI: Selects Subject & sets duration (10 mins)
    FacUI->>Gateway: POST /api/attendance/qr/create-session { subjectId, durationMinutes }
    Gateway->>QRCtrl: createQRSession()
    QRCtrl->>QRCtrl: crypto.randomBytes(32).toString('hex')
    QRCtrl->>QRCtrl: qrcode.toDataURL(sessionToken)
    QRCtrl->>DB: AttendanceSession.create({ faculty, subject, sessionToken, expiresAt })
    DB-->>QRCtrl: Session created
    QRCtrl-->>FacUI: Returns { qrCodeDataUrl, expiresAt, sessionId }
    FacUI-->>Faculty: Displays dynamic QR on classroom projector

    Student->>StuUI: Clicks "Scan QR Code" & points camera
    StuUI->>StuUI: Decodes QR data token
    StuUI->>Gateway: POST /api/attendance/qr/scan { sessionToken }
    Gateway->>QRCtrl: scanQRCode()
    QRCtrl->>DB: AttendanceSession.findOne({ sessionToken, isActive: true })
    alt Token expired or invalid
        QRCtrl-->>StuUI: HTTP 400 { message: "QR code has expired or is invalid" }
        StuUI-->>Student: Displays scan failure alert
    else Token active
        QRCtrl->>DB: Attendance.findOne({ student, subject, date: today })
        alt Duplicate scan
            QRCtrl-->>StuUI: HTTP 409 { message: "Attendance already recorded for today" }
        else Fresh scan
            QRCtrl->>DB: Attendance.create({ student, subject, status: 'Present', verifiedMethod: 'QR_Dynamic' })
            QRCtrl-->>StuUI: HTTP 200 { success: true, message: "Attendance verified successfully!" }
            StuUI-->>Student: Displays green verified checkmark
        end
    end
```

---

### 3.3 Study Material Upload, Automated RAG Vectorization & Question-Answering

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty Member
    actor Student as Student Member
    participant FacUI as FacultyMaterialsPage.jsx
    participant StuUI as StudentAIPage.jsx
    participant Gateway as Express Backend (/api)
    participant RAGService as ragService.js
    participant PyAI as Python AI Service (Port 8000)
    participant VectorStore as RAG Vector Store (TF-IDF / Disk)
    participant DB as MongoDB (Resource Collection)

    Faculty->>FacUI: Selects syllabus PDF & hits "Upload & Index"
    FacUI->>Gateway: POST /api/resources (multipart/form-data)
    Gateway->>Gateway: uploadMaterial inspects magic bytes (PDF %PDF-)
    Gateway->>DB: Resource.create({ title, fileUrl, ragIndexed: false })
    Gateway->>RAGService: ingestDocumentToRAG(resourceId, filePath)
    RAGService->>PyAI: POST /rag/ingest { document_id, file_base64, course_code }
    PyAI->>PyAI: PyPDF extracts text page-by-page
    PyAI->>PyAI: Sliding-window chunker (500 chars, 100 overlap)
    PyAI->>VectorStore: store.add_document() -> updates TF-IDF matrix & metadata.json
    PyAI-->>RAGService: HTTP 200 { success: true, chunks_indexed: 38 }
    RAGService->>DB: Resource.updateOne({ ragIndexed: true, chunkCount: 38 })
    Gateway-->>FacUI: HTTP 201 { success: true, message: "Document uploaded and indexed" }

    Student->>StuUI: Types: "What topics are covered in Unit 2?"
    StuUI->>Gateway: POST /api/ai/document-assistant/query { query, courseCode }
    Gateway->>RAGService: queryAcademicDocumentsRAG(query)
    RAGService->>PyAI: POST /rag/query { query, top_k: 4, role: "student" }
    PyAI->>VectorStore: store.search(query) -> cosine similarity calculation
    VectorStore-->>PyAI: Returns top 4 matching text passages
    PyAI->>PyAI: generate_rag_answer() formats answer & builds page citations
    PyAI-->>RAGService: HTTP 200 { answer, citations: [{ doc: "Syllabus.pdf", page: 4 }] }
    RAGService-->>Gateway: Passes response payload
    Gateway-->>StuUI: HTTP 200 { answer, citations }
    StuUI-->>Student: Renders verified answer with clickable citation badges
```

---

### 3.4 Academic Fee Checkout & Payment Reconciliation

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Member
    actor Admin as University Cashier / Admin
    participant StuUI as StudentFeesPage.jsx
    participant AdminUI as AdminFeesPage.jsx
    participant Gateway as Express Backend (/api/fees)
    participant FeeCtrl as feeController.js
    participant Razorpay as Razorpay Payment Gateway
    participant DB as MongoDB (FeeRecord & PaymentTransaction)

    Student->>StuUI: Clicks "Pay Semester Fee Online" (₹45,000)
    StuUI->>Gateway: POST /api/fees/order { feeRecordId, amount: 45000 }
    Gateway->>FeeCtrl: createPaymentOrder()
    FeeCtrl->>Razorpay: razorpay.orders.create({ amount: 4500000, currency: "INR" })
    Razorpay-->>FeeCtrl: Returns { id: "order_xyz123", amount: 4500000 }
    FeeCtrl->>DB: PaymentTransaction.create({ student, feeRecord, orderId, status: "Created" })
    FeeCtrl-->>StuUI: Returns { orderId, amount, keyId }
    StuUI->>Student: Opens Razorpay checkout modal
    Student->>Razorpay: Completes UPI/Card payment
    Razorpay-->>StuUI: Returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    StuUI->>Gateway: POST /api/fees/verify { orderId, paymentId, signature }
    Gateway->>FeeCtrl: verifyPayment()
    FeeCtrl->>FeeCtrl: crypto.createHmac('sha256').update(orderId + "|" + paymentId).digest('hex')
    alt Signature Matches
        FeeCtrl->>DB: PaymentTransaction.updateOne({ status: "Captured", paymentId })
        FeeCtrl->>DB: FeeRecord.findById(feeRecordId)
        DB-->>FeeCtrl: fee.paidAmount += 45000 -> fee.save() (pre-save triggers balance=0, status='Paid')
        FeeCtrl-->>StuUI: HTTP 200 { success: true, message: "Payment verified successfully" }
        StuUI-->>Student: Displays paid receipt and updated zero balance
    else Signature Mismatch
        FeeCtrl-->>StuUI: HTTP 400 { success: false, message: "Payment signature invalid" }
    end

    Admin->>AdminUI: Cashier records offline cash payment (₹15,000)
    AdminUI->>Gateway: POST /api/fees/offline-pay { studentId, feeRecordId, amount: 15000, receiptNumber }
    Gateway->>FeeCtrl: recordOfflinePayment()
    FeeCtrl->>DB: PaymentTransaction.create({ status: "Captured", paymentMethod: "Cash" })
    FeeCtrl->>DB: FeeRecord updates paidAmount & recalcs balance
    FeeCtrl-->>AdminUI: HTTP 200 { success: true, message: "Offline payment credited" }
```

