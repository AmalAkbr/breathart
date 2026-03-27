import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const AcademicOverview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BookOpen size={24} className="text-accent-cyan" />
        Academic Overview
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <p className="text-white/60 text-sm mb-1">Active Courses</p>
          <p className="text-3xl font-bold text-accent-cyan">0</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <p className="text-white/60 text-sm mb-1">Average Progress</p>
          <p className="text-3xl font-bold text-accent-blue">0%</p>
        </div>
      </div>
      <p className="text-white/50 text-sm mt-4">
        Enroll in courses to start your learning journey
      </p>
    </motion.div>
  );
};

export default AcademicOverview;
