import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ReadyToLearnCTA = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={`bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/30 rounded-2xl p-8 text-center ${className}`}
    >
      <h3 className="text-2xl font-bold text-white mb-3">Ready to Learn?</h3>
      <p className="text-white/70 mb-6">
        Explore our courses and start your journey to success
      </p>
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/courses")}
          className="px-8 py-3 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold rounded-lg hover:shadow-lg hover:shadow-accent-blue/50 transition-all duration-300"
        >
          Explore Courses
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReadyToLearnCTA;
