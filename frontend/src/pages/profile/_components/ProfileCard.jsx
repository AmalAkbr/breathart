import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";

const ProfileCard = ({ userDetails, userEmail, createdAt }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-1"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-lg sticky top-40">
        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-accent-cyan to-accent-blue rounded-full flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-2 border-slate-900 rounded-full" />
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">
            {userDetails?.fullName || userEmail?.split("@")[0]}
          </h2>
          <div className="flex items-center justify-center gap-2 text-accent-cyan/70 text-sm mb-2">
            <Mail size={16} />
            <span className="truncate">{userEmail}</span>
          </div>
          <p className="text-xs text-white/40">
            Member since{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

        {/* Profile Stats */}
        <div className="space-y-4">
          <div className="group cursor-pointer">
            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
              Account Status
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white font-medium">Active</span>
            </div>
          </div>
          <div className="group cursor-pointer">
            <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
              Account Type
            </p>
            <span className="text-white font-medium">Student</span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-8 px-4 py-2.5 bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 hover:from-accent-cyan/30 hover:to-accent-blue/30 border border-accent-cyan/40 text-accent-cyan rounded-lg font-medium transition-all duration-300"
        >
          Edit Profile
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
