# SmartCampus AI — Frontend Architecture & UI Documentation

**Document ID:** `03_FRONTEND_DOCUMENTATION`  
**Version:** 6.0.0  
**Generated Date:** 2026-10-28  
**Repository Working Directory:** `/Users/anurag93/Downloads/CodingZone/MajorProjects/SMARTCAMPUS/client`  
**Classification:** Frontend Technical Blueprint & Component Catalog  

---

## 1. Frontend Architecture Overview

The SmartCampus AI frontend is a single-page application (SPA) built on **React 18.3.1** and bundled with **Vite 5.4.6**. The presentation layer leverages **Tailwind CSS 3.4.11** extended with a custom academic midnight dark-mode palette and responsive typography. Data visualizations are rendered using **Recharts 3.10.1**, and icons are provided by **Lucide React 0.441.0**.

### 1.1 Entrypoint & Mounting Sequence
1. **`client/index.html`:** The HTML5 host template declaring the root viewport metadata, web font preconnects, and mounting point `<div id="root"></div>`.
2. **`client/src/main.jsx`:** Initializes the React application tree within a React 18 `createRoot` container. Wraps the root component hierarchy with:
   * `BrowserRouter` (React Router DOM v6) with future flags `v7_startTransition` and `v7_relativeSplatPath` enabled.
   * `ThemeProvider`: Global CSS theme class coordinator (`dark` / `light`).
   * `AuthProvider`: Authentication state provider managing user tokens and session revalidation.
3. **`client/src/App.jsx`:** The authoritative route registry defining public marketing/auth routes, student portal routes, faculty portal routes, admin portal routes, and fallback handlers.

---

## 2. Global State & Context Providers

### 2.1 Authentication Architecture (`client/src/context/AuthContext.jsx`)
* **State Variables:**
  * `user`: User object containing `id`, `name`, `email`, `role`, `department`, `avatar`, and populated `profile`.
  * `token`: Raw JWT token persisted in `localStorage.getItem('smartcampus_token')`.
  * `loading`: Boolean flag indicating initial session revalidation in flight.
  * `error`: Holds session or login rejection messages.
* **Initialization Flow:** On app mount, if a token exists in `localStorage`, `AuthContext` calls `GET /api/auth/me`. If valid, the user state is populated. If invalid or expired, the local session is cleared.
* **Exported Methods:**
  * `login(credentials)`: Posts to `POST /api/auth/login`, stores token in `localStorage`, populates `user`, and returns user role.
  * `logout()`: Clears `smartcampus_token`, sends `POST /api/auth/logout` to clear HTTP-only cookies, and resets state.
  * `updateUser(partialUser)`: Optimistically merges updated user details (e.g. updated avatar URL) into active context.

### 2.2 Theme Management Architecture (`client/src/context/ThemeContext.jsx`)
* **State Variables:**
  * `theme`: Current active theme string (`'dark'` or `'light'`).
  * `isDark`: Boolean convenience helper (`theme === 'dark'`).
* **Persistence & Synchronization:** Reads saved theme from `localStorage.getItem('smartcampus_theme')`. Defaults to `'dark'` or respects `window.matchMedia('(prefers-color-scheme: light)')`. On update, toggles the `dark` class on the `<html>` root document element (`document.documentElement.classList`).

---

## 3. Navigation & Routing Architecture

### 3.1 Route Guards & Protection (`client/src/components/ProtectedRoute.jsx`)
Every portal route is wrapped inside `<ProtectedRoute allowedRoles={[...]}>`:
1. If `loading === true`, renders a centered spinner (`Verifying SmartCampus AI Session...`).
2. If `isAuthenticated === false` or `!user`, redirects the browser to `/login` with `state: { from: location }`.
3. If `allowedRoles` does not include `user.role`, redirects the browser to `/unauthorized` (HTTP 403 simulation).
4. If authorized, renders the child page component.

### 3.2 Layout Shell (`client/src/components/DashboardLayout.jsx`)
All internal portal pages are contained within `DashboardLayout`:
* **Sidebar (`client/src/components/Sidebar.jsx`):** A fixed left navigation panel (width: 16rem / 64 tailwind units). Features university branding, current user identity card with role badge, role-filtered navigation menu, and a sign-out trigger. On mobile screens (<1024px), collapses off-canvas with a backdrop blur overlay.
* **Navbar (`client/src/components/Navbar.jsx`):** A sticky top header featuring a mobile menu toggle, university logo, role indicators, real-time unread notification dropdown polling `GET /api/notifications`, theme toggle button (Sun/Moon), and user avatar dropdown menu.
* **Main Content Area:** Max-width 7xl container with ambient glowing background blurs and animated transitions.

---

## 4. API Client & Network Interceptor Layer (`client/src/services/api.js`)

All frontend HTTP communication is routed through a singleton Axios instance:
* **Base URL:** Dynamic fallback via `import.meta.env.VITE_API_BASE_URL || '/api'`.
* **Credentials:** `withCredentials: true` enabled for cross-site cookie transmission.
* **Request Interceptor:** Automatically checks `localStorage.getItem('smartcampus_token')` and injects `Authorization: Bearer <token>` into outbound request headers.
* **Response Interceptor:** Intercepts HTTP 401 Unauthorized responses (excluding explicit login attempts) to automatically purge expired tokens from `localStorage` and reject the promise with a sanitized `error.userMessage`.

---

## 5. Complete Page & Component Inventory

| Page / Component | Repository File Path | Route URL | Role Scope | API Request Dependencies | Child Components | Implementation Status |
|---|---|---|---|---|---|---|
| **LandingPage** | `client/src/pages/LandingPage.jsx` | `/` | Public | None (Static presentation) | `SmartCampusLogo` | Verified Complete |
| **LoginPage** | `client/src/pages/LoginPage.jsx` | `/login` | Public | `POST /api/auth/login` | `SmartCampusLogo` | Verified Complete |
| **RegisterPage** | `client/src/pages/RegisterPage.jsx` | `/register` | Public | `POST /api/auth/register`, `GET /api/departments` | `SmartCampusLogo` | Verified Complete |
| **UnauthorizedPage** | `client/src/pages/UnauthorizedPage.jsx` | `/unauthorized` | Shared | None | None | Verified Complete |
| **NotFoundPage** | `client/src/pages/NotFoundPage.jsx` | `*` (Catch-all) | Shared | None | None | Verified Complete |
| **ProfilePage** | `client/src/pages/ProfilePage.jsx` | `/profile` | Universal | `GET /api/users/me`, `PATCH /api/users/me`, `POST /api/users/me/profile-picture` | `DashboardLayout`, `ProfilePictureModal` | Verified Complete |
| **StudentDashboard** | `client/src/pages/StudentDashboard.jsx` | `/student/dashboard` | Student | `GET /api/dashboard/student`, `GET /api/timetable/today`, `GET /api/notices` | `DashboardLayout`, `StatCard`, `LoadingSkeleton` | Verified Complete |
| **StudentCoursesPage** | `client/src/pages/StudentCoursesPage.jsx` | `/student/courses` | Student | `GET /api/courses`, `GET /api/courses/:id/syllabus` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentAttendancePage** | `client/src/pages/StudentAttendancePage.jsx` | `/student/attendance` | Student | `GET /api/attendance/summary`, `POST /api/attendance/qr/scan` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentTimetablePage** | `client/src/pages/StudentTimetablePage.jsx` | `/student/timetable` | Student | `GET /api/timetable` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentAssignmentsPage** | `client/src/pages/StudentAssignmentsPage.jsx` | `/student/assignments` | Student | `GET /api/assignments`, `POST /api/assignments/:id/submit` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentResultsPage** | `client/src/pages/StudentResultsPage.jsx` | `/student/results` | Student | `GET /api/results/my` | `DashboardLayout`, `LoadingSkeleton`, Recharts | Verified Complete |
| **StudentFeesPage** | `client/src/pages/StudentFeesPage.jsx` | `/student/fees` | Student | `GET /api/fees/my`, `GET /api/fees/structure`, `POST /api/fees/order`, `POST /api/fees/verify` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentResourcesPage** | `client/src/pages/StudentResourcesPage.jsx` | `/student/resources` | Student | `GET /api/resources` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentAIPage** | `client/src/pages/StudentAIPage.jsx` | `/student/ai-assistant` | Student | `POST /api/ai/chat`, `POST /api/ai/document-assistant/query`, `GET /api/ai/recommendations` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **StudentNoticesPage** | `client/src/pages/StudentNoticesPage.jsx` | `/student/notices` | Student | `GET /api/notices` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **FacultyDashboard** | `client/src/pages/FacultyDashboard.jsx` | `/faculty/dashboard` | Faculty | `GET /api/dashboard/faculty` | `DashboardLayout`, `StatCard`, `LoadingSkeleton` | Verified Complete |
| **FacultyClassesPage** | `client/src/pages/FacultyClassesPage.jsx` | `/faculty/classes` | Faculty | `GET /api/courses`, `GET /api/students` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **FacultyAttendancePage** | `client/src/pages/FacultyAttendancePage.jsx` | `/faculty/attendance` | Faculty | `POST /api/attendance/mark`, `POST /api/attendance/qr/create-session` | `DashboardLayout`, QR Canvas Generator | Verified Complete |
| **FacultyAssignmentsPage** | `client/src/pages/FacultyAssignmentsPage.jsx` | `/faculty/assignments` | Faculty | `GET /api/assignments`, `POST /api/assignments`, `POST /api/assignments/:id/grade` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **FacultyPerformancePage** | `client/src/pages/FacultyPerformancePage.jsx` | `/faculty/performance` | Faculty | `GET /api/analytics/faculty/overview`, `GET /api/ai/early-support` | `DashboardLayout`, Recharts | Verified Complete |
| **FacultyMaterialsPage** | `client/src/pages/FacultyMaterialsPage.jsx` | `/faculty/materials` | Faculty | `GET /api/resources`, `POST /api/resources`, `POST /api/resources/:id/reindex` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **FacultyNoticesPage** | `client/src/pages/FacultyNoticesPage.jsx` | `/faculty/notices` | Faculty | `GET /api/notices`, `POST /api/notices` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminDashboard** | `client/src/pages/AdminDashboard.jsx` | `/admin/dashboard` | Admin | `GET /api/dashboard/admin`, `GET /api/analytics/admin/overview` | `DashboardLayout`, `StatCard`, Recharts | Verified Complete |
| **AdminRegistrationsPage** | `client/src/pages/AdminRegistrationsPage.jsx` | `/admin/registrations` | Admin | `GET /api/admin/registration-requests`, `POST /api/admin/registration-requests/:id/approve` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminStudentsPage** | `client/src/pages/AdminStudentsPage.jsx` | `/admin/students` | Admin | `GET /api/students`, `POST /api/students`, `DELETE /api/students/:id` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminFacultyPage** | `client/src/pages/AdminFacultyPage.jsx` | `/admin/faculty` | Admin | `GET /api/faculty`, `POST /api/faculty`, `DELETE /api/faculty/:id` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminDepartmentsPage** | `client/src/pages/AdminDepartmentsPage.jsx` | `/admin/departments` | Admin | `GET /api/departments`, `POST /api/departments`, `PATCH /api/departments/:id` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminCoursesPage** | `client/src/pages/AdminCoursesPage.jsx` | `/admin/courses` | Admin | `GET /api/courses`, `POST /api/courses`, `GET /api/subjects`, `POST /api/subjects` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminTimetablePage** | `client/src/pages/AdminTimetablePage.jsx` | `/admin/timetable` | Admin | `GET /api/timetable`, `POST /api/timetable`, `DELETE /api/timetable/:id` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminAttendancePage** | `client/src/pages/AdminAttendancePage.jsx` | `/admin/attendance` | Admin | `GET /api/analytics/admin/overview` | `DashboardLayout`, Recharts | Verified Complete |
| **AdminFeesPage** | `client/src/pages/AdminFeesPage.jsx` | `/admin/fees` | Admin | `GET /api/fees`, `GET /api/fees/structures`, `POST /api/fees/offline-pay`, `POST /api/fees` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminNoticesPage** | `client/src/pages/AdminNoticesPage.jsx` | `/admin/notices` | Admin | `GET /api/notices`, `POST /api/notices`, `DELETE /api/notices/:id` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |
| **AdminAnalyticsPage** | `client/src/pages/AdminAnalyticsPage.jsx` | `/admin/analytics` | Admin | `GET /api/analytics/admin/overview`, `GET /api/analytics/admin/audit-logs` | `DashboardLayout`, Recharts | Verified Complete |
| **AdminSettingsPage** | `client/src/pages/AdminSettingsPage.jsx` | `/admin/settings` | Admin | `GET /api/health`, `GET /api/ai/status`, `GET /api/analytics/admin/audit-logs` | `DashboardLayout`, `LoadingSkeleton` | Verified Complete |

---

## 6. Detailed Functional Workflow Implementations

### 6.1 Authentication & Session Handling
* **Login Form:** Allows role toggle or automatic server-side role resolution. Supports pre-filling demo credentials for testing (`student@smartcampus.edu`, `faculty@smartcampus.edu`, `admin@smartcampus.edu`).
* **Registration Portal:** Captures name, email, department, requested role, password, and roll number. Displays confirmation with application tracking ID.
* **Avatar Management (`ProfilePictureModal.jsx`):** Features dual input modes: native file upload or direct camera stream using `navigator.mediaDevices.getUserMedia()`. Images are drawn to an HTML5 canvas, converted to JPEG blob, and uploaded to `POST /api/users/me/profile-picture`.

### 6.2 QR Attendance Check-In Pipeline
1. Faculty selects subject and duration (e.g. 10 minutes) on `FacultyAttendancePage`.
2. Faculty hits "Generate Dynamic QR Session", calling `POST /api/attendance/qr/create-session`.
3. Backend creates an `AttendanceSession` record and generates a QR data URI containing a dynamic token.
4. Student opens `StudentAttendancePage`, clicks "Scan QR Code", and points device camera or enters the session code.
5. Client submits token to `POST /api/attendance/qr/scan`.
6. Backend validates token validity, expiration, and records `Attendance` as `Present`.

### 6.3 Student AI Assistant & RAG Interface (`StudentAIPage.jsx`)
Features a tabbed interface providing three distinct AI capabilities:
1. **Campus AI Chatbot:** Interactive conversational assistant answering campus queries regarding timings, facilities, rules, and procedures via `POST /api/ai/chat`.
2. **Academic Document Question-Answering (RAG):** Student asks a question regarding course syllabus or lecture notes (e.g., "What are the topics in Unit 3 of Cloud Computing?"). Query is sent to `POST /api/ai/document-assistant/query`. UI displays grounded answer along with exact source document names and page numbers in citation pills.
3. **Personalized Study Recommendations:** Calls `GET /api/ai/recommendations` to inspect student weak areas and provides targeted study resource recommendations.

