import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = user?.user_type === 'member' ? 'member' : user?.role;
    if (!allowedRoles.includes(userRole) && !allowedRoles.includes(user?.user_type)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
