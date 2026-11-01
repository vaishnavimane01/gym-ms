import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastContainer from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

// Auth Page
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Products from './pages/admin/Products';
import POS from './pages/admin/POS';
import Trainers from './pages/admin/Trainers';
import Schedule from './pages/admin/Schedule';
import AuditTrail from './pages/admin/AuditTrail';
import GymPlans from './pages/admin/GymPlans';
import CheckIn from './pages/admin/CheckIn';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import BookSession from './pages/member/BookSession';
import MyBookings from './pages/member/MyBookings';
import MemberAttendance from './pages/member/MemberAttendance';
import WorkoutDiet from './pages/member/WorkoutDiet';

function RootRedirect() {
  const { isAuthenticated, isMember } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isMember) {
    return <Navigate to="/member/dashboard" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Back-Office Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Owner', 'Receptionist', 'admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="members" element={<Members />} />
            <Route path="plans" element={<GymPlans />} />
            <Route path="products" element={<Products />} />
            <Route path="pos" element={<POS />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="audit" element={<AuditTrail />} />
          </Route>

          {/* Member Customer Self-Service Portal */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['member', 'Member']}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="attendance" element={<MemberAttendance />} />
            <Route path="routine" element={<WorkoutDiet />} />
            <Route path="book" element={<BookSession />} />
            <Route path="bookings" element={<MyBookings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
