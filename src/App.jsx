// Form Academy — App Router
//
// Route protection:
//   Public:        /  /enrollment  /login  /activate
//   Student only:  /dashboard  (any authenticated user)
//   Admin only:    /admin  /admin/*

import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Navbar            from './components/Navbar'
import Hero              from './components/Hero'
import TrustSection      from './components/TrustSection'
import CoursesSection          from './components/CoursesSection'
import LearningSystemSection   from './components/LearningSystemSection'
import ExperienceSection       from './components/ExperienceSection'
import CTASection        from './components/CTASection'
import Footer            from './components/Footer'
import EnrollmentPage    from './pages/EnrollmentPage'
import LoginPage         from './pages/LoginPage'
import ActivatePage      from './pages/ActivatePage'

// Dashboard (student protected)
import DashboardPage     from './pages/DashboardPage'
import CoursePage        from './pages/CoursePage'
import LessonPage        from './pages/LessonPage'

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminLeads        from './pages/admin/AdminLeads'
import AdminStudents     from './pages/admin/AdminStudents'
import AdminCourses      from './pages/admin/AdminCourses'

// ─── Homepage ──────────────────────────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="w-full">
      <Navbar onEnroll={() => navigate('/enrollment')} onLogin={() => navigate('/login')} />
      <Hero onEnroll={() => navigate('/enrollment')} />
      <TrustSection />
      <CoursesSection onEnroll={() => navigate('/enrollment')} />
      <LearningSystemSection />
      <ExperienceSection />
      <CTASection onEnroll={() => navigate('/enrollment')} />
      <Footer onEnroll={() => navigate('/enrollment')} />
    </div>
  )
}

// ─── Enrollment wrapper — provides useNavigate to EnrollmentPage ─────────────
function EnrollmentRoute() {
  const navigate = useNavigate()
  return <EnrollmentPage onBack={() => navigate('/')} />
}

// ─── Admin redirect — sends admin users from /dashboard to /admin ──────────
function DashboardRouter() {
  const { userDoc, loading } = useAuth()
  if (loading) return null
  if (userDoc?.role === 'admin') return <Navigate to="/admin" replace />
  return <DashboardPage />
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
        <Routes>
          {/* Public routes */}
          <Route path="/"           element={<HomePage />} />
          <Route path="/enrollment" element={<EnrollmentRoute />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/activate"   element={<ActivatePage />} />

          {/* Student dashboard — auth required, any role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Course routes — auth required, any role */}
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes — auth required, role=admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute role="admin">
                <AdminLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute role="admin">
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute role="admin">
                <AdminCourses />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
