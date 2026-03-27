import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getAuthToken } from '../utils/apiClient';

/**
 * Public Route Component
 * For login, register, and public pages
 * If already logged in, redirects to appropriate page based on role
 * Prevents users from accessing auth pages while authenticated
 */
export const PublicRoute = ({ children }) => {
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

  // Already logged in - redirect to appropriate page
  if (isLoggedIn && token && user) {
    // If admin - go to admin panel
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // If user and email verified - go to profile
    if (user.isEmailVerified) {
      return <Navigate to="/profile" replace />;
    }
    // If user but email not verified - go to verify-email
    return <Navigate to="/verify-email" replace />;
  }

  // Not logged in - allow access to public page
  return children;
};

export default PublicRoute;
