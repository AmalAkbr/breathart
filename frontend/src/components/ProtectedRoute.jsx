import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getAuthToken } from '../utils/apiClient';

/**
 * Protected Route Component
 * Checks if user is logged in before allowing access to routes
 * For regular user profile routes
 */
export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useUserStore();
  const token = getAuthToken();

  // Still loading user state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn || !token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Email not verified
  if (!user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
