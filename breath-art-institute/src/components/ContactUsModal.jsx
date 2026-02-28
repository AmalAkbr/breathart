import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, X, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const ContactUsModal = ({ isOpen, onClose }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="contact-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
                    />

                    {/* Modal */}
                    <motion.div
                        key="contact-modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[92vw] max-w-lg bg-[#0d1b2e] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-y-auto max-h-[90vh]"
                        data-lenis-prevent="true"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">Get In Touch</h3>
                                <p className="text-slate-400 text-xs mt-0.5">We're happy to hear from you</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6 space-y-5">

                            {/* Phone */}
                            <a
                                href="tel:+918590144794"
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 flex items-center justify-center shrink-0 group-hover:bg-accent-cyan/25 transition-colors">
                                    <Phone className="w-5 h-5 text-accent-cyan" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Phone</p>
                                    <p className="text-white font-semibold">+91 8590 144 794</p>
                                </div>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/918590144794"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-green-400/40 hover:bg-green-400/5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0 group-hover:bg-green-500/25 transition-colors">
                                    <MessageCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">WhatsApp</p>
                                    <p className="text-white font-semibold">Chat with us instantly</p>
                                </div>
                            </a>

                            {/* Emails */}
                            <div className="grid grid-cols-1 gap-3">
                                <a
                                    href="mailto:info@breathartinstitute.in"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center shrink-0 group-hover:bg-accent-blue/25 transition-colors">
                                        <Mail className="w-5 h-5 text-accent-blue" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Email (India)</p>
                                        <p className="text-white font-semibold truncate">info@breathartinstitute.in</p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:info@breathart.ae"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center shrink-0 group-hover:bg-accent-blue/25 transition-colors">
                                        <Mail className="w-5 h-5 text-accent-blue" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Email (UAE)</p>
                                        <p className="text-white font-semibold truncate">info@breathart.ae</p>
                                    </div>
                                </a>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Address</p>
                                    <p className="text-white font-semibold">Karthika Tower, Attingal</p>
                                    <p className="text-slate-400 text-sm">Trivandrum, Kerala</p>
                                </div>
                            </div>

                            {/* Social links */}
                            <div className="flex gap-3 pt-1">
                                <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-pink-500/40 hover:bg-pink-500/5 transition-all text-sm font-medium">
                                    <Instagram className="w-4 h-4" /> Instagram
                                </a>
                                <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-sm font-medium">
                                    <Facebook className="w-4 h-4" /> Facebook
                                </a>
                                <a href="https://www.linkedin.com/company/breathart-marketing-agency/" target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-400/40 hover:bg-blue-400/5 transition-all text-sm font-medium">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                </a>
                                <a href="https://x.com/BreathartInd" target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-slate-400/40 hover:bg-slate-400/5 transition-all text-sm font-medium">
                                    <Twitter className="w-4 h-4" /> X
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactUsModal;
