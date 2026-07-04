import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft } from "lucide-react";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-slate-200 p-8 md:p-16 rounded-3xl shadow-xl shadow-slate-200/50 max-w-2xl w-full text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
          Thank You!
        </h1>
        
        <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto">
          We have successfully received your form submission. Our team will review your details and get back to you shortly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent-blue/30 transition-all group w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Link
            to="/courses"
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all w-full sm:w-auto justify-center"
          >
            Explore Courses
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
