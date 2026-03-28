import { motion } from "framer-motion";
import {
  LogOut,
  Calendar,
  FileVideo,
} from "lucide-react";
import { Link } from "react-router-dom";

const ProfileHeader = ({ userName, onLogout }) => {
  const stats = [
    { icon: Calendar, label: "Member Since", value: "New" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-accent-cyan via-accent-blue to-purple-400 bg-clip-text text-transparent mb-2">
            Student Dashboard
          </h1>
          <p className="text-white/60 font-medium">Welcome back, {userName}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/videos">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 rounded-lg transition-all duration-300"
            >
              <FileVideo size={18} />
              <span className="font-medium">Watch Videos</span>
            </motion.button>
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              console.log("[PROFILE HEADER] Logout button clicked");
              onLogout();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-lg transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-4 max-w-xs">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} className="text-accent-cyan" />
              <span className="text-xs uppercase tracking-wide text-white/50">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
