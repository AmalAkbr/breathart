// frontend/src/pages/Admin/AdminProtected.jsx
/**
 * Protected Admin Route Wrapper
 * Verifies admin status before allowing access to admin dashboard
 * Checks: user.role === 'admin' AND user.isAdmin === true (dual verification)
 */
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { getAuthToken } from '../../utils/apiClient';
import { toast } from '../../utils/toast';

const AdminProtected = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true = admin, false = not admin
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useUserStore();

  useEffect(() => {
    const verifyAdminAccess = () => {
      try {
        const token = getAuthToken();
        console.log('[ADMIN PROTECTED] Verifying admin access...');
        console.log('[ADMIN PROTECTED] Token exists:', !!token);
        console.log('[ADMIN PROTECTED] User:', user?.email);
        console.log('[ADMIN PROTECTED] Role:', user?.role);
        console.log('[ADMIN PROTECTED] isAdmin flag:', user?.isAdmin);

        // Dual verification: Check both role AND isAdmin flag
        if (isLoggedIn && token && user?.role === 'admin' && user?.isAdmin === true) {
          console.log('✅ Admin verification successful - role=admin AND isAdmin=true');
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        console.warn('❌ Admin verification failed - redirecting to login');
        console.warn('[ADMIN PROTECTED] isLoggedIn:', isLoggedIn, '| role:', user?.role, '| isAdmin:', user?.isAdmin);
        
        // Show error message
        if (isLoggedIn && token && user) {
          // User is logged in but NOT admin
          toast.error('This account does not have admin privileges');
        }
        
        setIsAdmin(false);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error verifying admin access:', error);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [user, isLoggedIn]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not admin - redirect to home
  if (!isAdmin) {
    // Small delay to allow toast to display
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Access Denied</div>
          <p className="text-gray-400 mb-6">Redirecting...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Admin verified - render children (AdminDashboard)
  return children;
};

export default AdminProtected;
