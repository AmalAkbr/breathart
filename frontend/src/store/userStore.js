import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User State Store - Zustand with localStorage persistence
 * Manages global user state across the application
 * Email, name, and role are immutable on frontend (set only by backend)
 * State persists across page refreshes and navigation
 */
export const useUserStore = create(
  persist(
    (set, get) => ({
      // User data
      user: null,
      isLoggedIn: false,
      loading: false,
      error: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isLoggedIn: !!user,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      logout: () => {
        // Clear localStorage completely
        localStorage.removeItem('user-store');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin-token');
        return set({ 
          user: null, 
          isLoggedIn: false, 
          error: null 
        });
      },

      // ===== HELPER SELECTORS =====

      /**
       * Check if user is admin - DUAL VERIFICATION
       * Both role === 'admin' AND isAdmin === true required
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' && user?.isAdmin === true;
      },

      /**
       * Check if user is regular user (not admin)
       */
      isUser: () => {
        const { user } = get();
        return user?.role === 'user' && !get().isAdmin();
      },

      /**
       * Check if email is verified
       */
      isEmailVerified: () => {
        const { user } = get();
        return user?.isEmailVerified === true;
      },

      /**
       * Check if user can access admin panel - DUAL VERIFICATION
       * Both role === 'admin' AND isAdmin === true required
       */
      canAccessAdmin: () => {
        const { isLoggedIn, user } = get();
        return isLoggedIn && user?.role === 'admin' && user?.isAdmin === true;
      },

      /**
       * Check if user can access user profile
       */
      canAccessProfile: () => {
        const { isLoggedIn, user } = get();
        return isLoggedIn && user?.email;
      },

      /**
       * Get user role
       */
      getUserRole: () => {
        const { user } = get();
        return user?.role || null;
      },

      // Read-only properties - cannot be changed on frontend
      // user.email - immutable
      // user.fullName - immutable  
      // user.role - immutable (user, admin)
      // user.isEmailVerified - immutable
    }),
    {
      name: 'user-store', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }), // Only persist user and isLoggedIn, not loading/error
    }
  )
);

/**
 * Usage in components:
 * 
 * // Get state
 * const { user, isLoggedIn } = useUserStore();
 * 
 * // Call actions
 * const setUser = useUserStore(s => s.setUser);
 * const logout = useUserStore(s => s.logout);
 * 
 * // Check permissions
 * const isAdmin = useUserStore(s => s.isAdmin());
 * const canAccessAdmin = useUserStore(s => s.canAccessAdmin());
 * const canAccessProfile = useUserStore(s => s.canAccessProfile());
 */
