import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentCoursesPage from './pages/StudentCoursesPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentTimetablePage from './pages/StudentTimetablePage';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import StudentResultsPage from './pages/StudentResultsPage';
import StudentFeesPage from './pages/StudentFeesPage';
import StudentResourcesPage from './pages/StudentResourcesPage';
import StudentNoticesPage from './pages/StudentNoticesPage';
import StudentAIPage from './pages/StudentAIPage';

// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyClassesPage from './pages/FacultyClassesPage';
import FacultyAttendancePage from './pages/FacultyAttendancePage';
import FacultyAssignmentsPage from './pages/FacultyAssignmentsPage';
import FacultyPerformancePage from './pages/FacultyPerformancePage';
import FacultyMaterialsPage from './pages/FacultyMaterialsPage';
import FacultyNoticesPage from './pages/FacultyNoticesPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminFacultyPage from './pages/AdminFacultyPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminTimetablePage from './pages/AdminTimetablePage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AdminFeesPage from './pages/AdminFeesPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

// Root redirector based on authenticated state
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentTimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentAssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/fees"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentFeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/resources"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notices"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentNoticesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/ai-assistant"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentAIPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Faculty Protected Routes */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/classes"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/courses"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/assignments"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyAssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/performance"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyPerformancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/materials"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyMaterialsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/notices"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyNoticesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/*"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/faculty"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminFacultyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDepartmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminTimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminFeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notices"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminNoticesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Universal Protected Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
