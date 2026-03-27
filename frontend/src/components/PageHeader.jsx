import { useNavigate } from "react-router-dom";
import { LogOut, Home, Shield } from "lucide-react";
import { useUserStore } from "../store/userStore";
import { authAPI } from "../utils/apiClient";
import { motion } from "framer-motion";
import { toast } from "../utils/toast";
import Logo from "./Logo";

/**
 * PageHeader - Displayed on Login, Register, Profile, and VerifyEmail pages
 * Shows navigation and user profile (if logged in)
 */
const PageHeader = ({ hideUserSection = false, showHomeBtn = false, showAdminBtn = false }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useUserStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      localStorage.removeItem("auth_token");
      toast.success("✓ Logged out successfully");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  // Get first letter of email for avatar
  const getAvatarLetter = () => {
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900 via-slate-900 to-transparent backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            <Logo />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Home Button (for Admin/Profile pages) */}
            {showHomeBtn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan transition-all"
              >
                <Home size={18} />
                <span className="text-sm font-medium">Home</span>
              </motion.button>
            )}

            {/* Admin Button (for Profile pages) */}
            {showAdminBtn && user?.role === "admin" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-all"
              >
                <Shield size={18} />
                <span className="text-sm font-medium">Administration</span>
              </motion.button>
            )}

            {/* User Profile Section (Hide on Login/Register) */}
            {!hideUserSection && isLoggedIn && user && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-white font-bold text-sm">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName || user.email}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getAvatarLetter()
                  )}
                </div>

                {/* User Name/Email */}
                <div className="hidden sm:flex flex-col">
                  <p className="text-sm font-semibold text-white">
                    {user.fullName || user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-white/50">{user.role}</p>
                </div>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default PageHeader;
