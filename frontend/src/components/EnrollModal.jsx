import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { submitToFormspree } from "../utils/formspree";

const inputClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all text-sm";

const EnrollModal = ({ open, onClose, defaultCourse = "" }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: defaultCourse || "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  // Reset form + status and lock scroll every time the modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ name: "", email: "", phone: "", course: defaultCourse || "", message: "" });

      setStatus("idle");
      document.body.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
    };
  }, [open]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitToFormspree(e.currentTarget, {
        subject: `Course Enrollment - ${form.course || defaultCourse || "Not specified"}`,
        from_name: form.name,
        course: form.course || defaultCourse || "Not specified",
        message: form.message || "—",
      });
      setForm({ name: "", email: "", phone: "", course: defaultCourse || "", message: "" });
      onClose();
      navigate("/thank-you");
    } catch (error) {
      console.error("Enrollment form submission failed:", error);
      setStatus("error");
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="enroll-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[90]"
          />

          {/* Centering container */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            {/* Modal — large, two-column on desktop */}
            <motion.div
              key="enroll-modal"
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-y-auto flex flex-col max-h-[90vh] pointer-events-auto"
            >
              {/* Glow blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 blur-[80px] pointer-events-none" />

              <div className="flex flex-col md:flex-row flex-1 min-h-0 relative z-10">
                {/* ── Left panel ─────────────────────────────────────── */}
                <div className="md:w-[42%] bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0d2137] flex flex-col justify-between shrink-0">
                  {/* Mobile: compact horizontal strip */}
                  <div className="flex md:hidden items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-accent-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-tight">
                        Enroll in Your Dream Course
                      </p>
                      {defaultCourse && (
                        <p className="text-accent-cyan text-xs truncate mt-0.5">
                          {defaultCourse}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop: full vertical panel */}
                  <div className="hidden md:flex flex-col justify-between flex-1 p-10">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center mb-6">
                        <BookOpen className="w-6 h-6 text-accent-cyan" />
                      </div>

                      <h2 className="text-white font-bold text-3xl leading-tight mb-3">
                        Enroll in Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
                          Dream Course
                        </span>
                      </h2>
                      <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Fill in your details and our admissions team will reach
                        out within 24 hours to confirm your enrollment.
                      </p>

                      {/* Selected course badge */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                          Selected Program
                        </p>
                        <h4 className="text-white font-bold leading-tight line-clamp-2">
                          {form.course || defaultCourse || "Not specified"}
                        </h4>
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-accent-cyan/20 text-accent-cyan text-xs font-bold px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                          Admissions Open
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs mt-8">
                      BreathArt Institute of Creative Technology, Attingal,
                      Trivandrum
                    </p>
                  </div>
                </div>

                {/* ── Right panel: Form ───────────────────────────────── */}
                <div
                  data-lenis-prevent="true"
                  className="flex-1 p-5 md:p-6 overflow-y-auto"
                >
                  {/* Close on desktop */}
                  <div className="hidden md:flex justify-end mb-2">
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-slate-900 font-bold text-xl mb-1">
                    Your Details
                  </h3>
                  <p className="text-slate-400 text-sm mb-7">
                    We'll use these to get in touch with you
                  </p>

                  {/* Success */}
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-14 text-center"
                    >
                      <CheckCircle className="w-16 h-16 text-green-500" />
                      <h4 className="text-2xl font-bold text-slate-900">
                        You're Registered!
                      </h4>
                      <p className="text-slate-500 text-sm max-w-xs">
                        Our team will reach out within 24 hours to confirm your
                        enrollment.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-sm hover:shadow-lg transition-all"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}

                  {/* Error */}
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Something went wrong. Please try again.
                    </motion.div>
                  )}

                  {/* Form */}
                  {status !== "success" && (
                    <form
                      className="space-y-3"
                      onSubmit={handleSubmit}
                      action="https://formspree.io/f/myyagyqg"
                      method="POST"
                      noValidate
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="+91 00000 00000"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="you@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">
                          Interested Course *
                        </label>
                        <select
                          name="course"
                          value={form.course}
                          onChange={handleChange}
                          className={inputClass + " appearance-none cursor-pointer"}
                          required
                        >
                          <option value="" disabled>Select a course</option>
                          <option value="Advanced Digital Marketing">Advanced Digital Marketing</option>
                          <option value="Creative Education">Creative Education</option>
                          <option value="Master Diploma in AI Digital Marketing">Master Diploma in AI Digital Marketing</option>
                          <option value="Diploma in AI Digital Marketing">Diploma in AI Digital Marketing</option>
                          <option value="Diploma in Graphic Design & Photography">Diploma in Graphic Design & Photography</option>
                          <option value="SEO Mastery">SEO Mastery</option>
                          <option value="Social Media Management">Social Media Management</option>
                          <option value="Other">Other / Not Sure</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">
                          Message{" "}
                          <span className="font-normal normal-case text-slate-400">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          className={inputClass + " resize-none min-h-[60px]"}
                          placeholder="Any questions or special requirements?"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-base hover:shadow-xl hover:shadow-accent-blue/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />{" "}
                            Submitting…
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />{" "}
                            Submit Enrollment
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default EnrollModal;
