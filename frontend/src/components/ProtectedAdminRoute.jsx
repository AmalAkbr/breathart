import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getAuthToken } from '../utils/apiClient';
import { toast } from '../utils/toast';

/**
 * Protected Admin Route Component
 * Only allows access if user has admin role AND isAdmin = true (dual verification)
 * Redirects non-admins to profile or login with error message
 */
export const ProtectedAdminRoute = ({ children }) => {
  const { isLoggedIn, user, loading, canAccessAdmin } = useUserStore();
  const token = getAuthToken();

  console.log("[PROTECTED ADMIN ROUTE] Checking access - loading:", loading, "isLoggedIn:", isLoggedIn, "user:", user?.email, "role:", user?.role, "isAdmin:", user?.isAdmin, "token:", token ? "✓" : "✗");

  // Still loading user state
  if (loading) {
    console.log("[PROTECTED ADMIN ROUTE] ⏳ Loading - showing loader");
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
    console.log("[PROTECTED ADMIN ROUTE] ❌ Not authenticated - redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Not admin - DUAL VERIFICATION FAILED
  if (!canAccessAdmin()) {
    console.warn(`🚫 [PROTECTED ADMIN ROUTE] Access denied: User ${user.email} (role=${user.role}, isAdmin=${user.isAdmin})`);
    toast.error('This account does not have admin privileges');
    // Redirect after a brief delay so user sees the error
    setTimeout(() => {
      window.location.href = '/profile';
    }, 1500);
    return null;
  }

  console.log("[PROTECTED ADMIN ROUTE] ✅ Access granted for admin:", user.email);
  return children;
};

export default ProtectedAdminRoute;
