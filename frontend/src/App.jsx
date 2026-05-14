import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/ui';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Seeker pages
import HomePage from './pages/seeker/HomePage';
import JobsPage from './pages/seeker/JobsPage';
import JobDetailsPage from './pages/seeker/JobDetailsPage';
import ApplicationsPage from './pages/seeker/ApplicationsPage';
import ProfilePage from './pages/seeker/ProfilePage';
import NotificationsPage from './pages/seeker/NotificationsPage';

// Employer pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import CreateJobPage from './pages/employer/CreateJobPage';
import ApplicantsPage from './pages/employer/ApplicantsPage';
import EmployerJobsPage from './pages/employer/EmployerJobsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-black">ف</span>
          </div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EMPLOYER') return <Navigate to="/employer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public-only route (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  console.log('PublicRoute - user:', user, 'loading:', loading);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EMPLOYER') return <Navigate to="/employer" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - بدون PublicRoute للتجربة */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Job Seeker routes */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
          <JobsPage />
        </ProtectedRoute>
      } />
      <Route path="/jobs/:id" element={
        <ProtectedRoute>
          <JobDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
          <ApplicationsPage />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Employer routes */}
      <Route path="/employer" element={
        <ProtectedRoute allowedRoles={['EMPLOYER']}>
          <EmployerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employer/create-job" element={
        <ProtectedRoute allowedRoles={['EMPLOYER']}>
          <CreateJobPage />
        </ProtectedRoute>
      } />
      <Route path="/employer/jobs" element={
        <ProtectedRoute allowedRoles={['EMPLOYER']}>
          <EmployerJobsPage />
        </ProtectedRoute>
      } />
      <Route path="/employer/applicants" element={
        <ProtectedRoute allowedRoles={['EMPLOYER']}>
          <ApplicantsPage />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}