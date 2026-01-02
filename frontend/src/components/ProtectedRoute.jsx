import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  console.log('[ProtectedRoute] Path:', location.pathname);
  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated);
  console.log('[ProtectedRoute] isLoading:', isLoading);
  console.log('[ProtectedRoute] user:', user);
  console.log('[ProtectedRoute] allowedRoles:', allowedRoles);

  if (isLoading) {
    console.log('[ProtectedRoute] Still loading...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(`[ProtectedRoute] Access denied: User role '${user?.role}' not in allowed roles:`, allowedRoles);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[ProtectedRoute] Access granted, rendering children');
  return children;
}

export default ProtectedRoute;
