import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mail, Phone, Link as LinkIcon, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

const JobApplicationModal = ({ isOpen, onClose, jobTitle }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Disable lenis main scroll if needed, but data-lenis-prevent handles the modal scroll
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mock API call delay
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);

            // Auto close after success
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 3000);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#0a0f1a]/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
                    >
                        <div className="bg-bg-dark border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl shadow-accent-cyan/10 overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="p-6 md:p-8 border-b border-white/10 shrink-0 relative bg-bg-mid">
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-white hover:rotate-90 transition-all p-2 bg-white/5 hover:bg-white/10 rounded-full"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <span className="text-accent-cyan font-bold tracking-widest uppercase text-xs mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Application
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white pr-12 line-clamp-2">
                                    {jobTitle}
                                </h2>
                                <p className="text-slate-400 mt-2 text-sm md:text-base">
                                    Fill out the form below to apply for this position. We'll get back to you soon!
                                </p>
                            </div>

                            {/* Scrollable Content */}
                            <div
                                data-lenis-prevent="true"
                                className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-bg-dark to-bg-mid"
                            >
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-12 flex flex-col items-center justify-center text-center text-white"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                            <Send className="w-8 h-8 text-accent-cyan" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                                        <p className="text-slate-400 max-w-md">
                                            Thank you for applying for the {jobTitle} position. Our team will review your application and get in touch.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Full Name *</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Phone Number *</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Phone className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        required
                                                        className="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
                                                        placeholder="+91 98765 43210"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Email Address *</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Portfolio / Resume Link */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Portfolio / Resume Link *</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <input
                                                    type="url"
                                                    required
                                                    className="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
                                                    placeholder="https://yourportfolio.com or GDrive link"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Please provide a link to your resume or portfolio (Google Drive, Dropbox, Portfolio website, etc.)</p>
                                        </div>

                                        {/* Cover Letter / Message */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Cover Letter (Optional)</label>
                                            <textarea
                                                rows="4"
                                                className="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all resize-none custom-scrollbar"
                                                placeholder="Tell us why you're a great fit for this role..."
                                            ></textarea>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-lg hover:shadow-lg hover:shadow-accent-cyan/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-4 relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:-translate-y-0.5">
                                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                                {!isSubmitting && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                            </span>

                                            {/* Hover highlight */}
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JobApplicationModal;
