import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { role } = useAuthStore();

  if (!allowedRoles.includes(role)) {
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
