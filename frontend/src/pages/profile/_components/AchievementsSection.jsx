import { motion } from "framer-motion";
import { Award } from "lucide-react";

const AchievementsSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Award size={24} className="text-purple-400" />
        Achievements & Certificates
      </h3>
      <div className="space-y-3">
        <p className="text-white/60 text-sm italic">
          Complete courses to earn certificates and achievements
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementsSection;
