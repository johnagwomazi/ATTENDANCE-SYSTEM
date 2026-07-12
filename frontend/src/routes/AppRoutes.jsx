import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { ManagerLayout } from '../layouts/ManagerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import StudentDashboard from '../pages/student/Dashboard';
import Attendance from '../pages/student/Attendance';
import Profile from '../pages/student/Profile';
import History from '../pages/student/History';
import ManagerDashboard from '../pages/manager/Dashboard';
import LiveAttendance from '../pages/manager/LiveAttendance';
import AdminDashboard from '../pages/admin/Dashboard';
import Students from '../pages/admin/Students';
import Courses from '../pages/admin/Courses';
import Enrollments from '../pages/admin/Enrollments';
import AdminAttendance from '../pages/admin/Attendance';
import Reports from '../pages/admin/Reports';
import QrDisplay from '../pages/shared/QrDisplay';
import NotFound from '../pages/shared/NotFound';

const HomeRedirect = () => {
  const { isAuthenticated, role, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/checkin" element={<Attendance publicMode />} />

        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<History />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['manager', 'admin']} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="live-attendance" element={<LiveAttendance />} />
          </Route>
          <Route path="/qr-display" element={<QrDisplay />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="courses" element={<Courses />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
