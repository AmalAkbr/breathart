import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../../store/userStore";
import { authAPI } from "../../utils/apiClient";
import { toast } from "../../utils/toast";

// Import child components
import ProfileHeader from "./_components/ProfileHeader";
import ProfileCard from "./_components/ProfileCard";
import ExamNotificationsSection from "./_components/ExamNotificationsSection";
import ReadyToLearnCTA from "./_components/ReadyToLearnCTA";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading, logout } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [examNotifications, setExamNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, loading, navigate]);

  useEffect(() => {
    const fetchExamNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const response = await authAPI.getExamNotifications();
        setExamNotifications(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("[PROFILE] Failed to fetch exam notifications:", error.message);
        setExamNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (!loading && isLoggedIn && user) {
      fetchExamNotifications();
    }
  }, [isLoggedIn, loading, user]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("[LOGOUT PROFILE] Logout initiated");
      
      // Call backend logout endpoint
      await authAPI.logout();
      
      // Clear Zustand store
      logout();
      
      // Clear localStorage
      localStorage.removeItem("auth_token");
      
      console.log("[LOGOUT PROFILE] Logout successful!");
      toast.success("✓ Logged out successfully");
      
      // Navigate to login
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("[LOGOUT PROFILE] Logout error:", err);
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-accent-blue/30 border-t-accent-cyan rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - this should be handled by ProtectedRoute, but just in case
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-4"
        >
          <p className="text-red-400 font-medium mb-4">Not authenticated</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-10 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <ProfileHeader
          userName={user?.fullName || user?.email?.split("@")[0] || "User"}
          userEmail={user?.email}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard
              userDetails={{ fullName: user?.fullName }}
              userEmail={user?.email}
              createdAt={user?.createdAt || new Date().toISOString()}
            />

            {/* Desktop: CTA under profile card */}
            <div className="hidden lg:block">
              <ReadyToLearnCTA className="mt-0" />
            </div>
          </div>

          {/* Right Column - Content Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <ExamNotificationsSection
              notifications={examNotifications}
              isLoading={notificationsLoading}
            />
          </motion.div>
        </div>

        {/* Mobile: CTA at very bottom of all content */}
        <div className="lg:hidden">
          <ReadyToLearnCTA className="mt-12" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
