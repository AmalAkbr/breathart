import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────
//  Web3Forms sends form data straight to your email inbox.
//  Free tier – 250 submissions/month, no backend needed.
//  Access key is tied to info@breathartinstitute.in
//  Get/replace key at: https://web3forms.com
// ─────────────────────────────────────────────────────────
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || 'YOUR_WEB3FORMS_KEY'; // Replace with real key in .env file

const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all';

const Admission = () => {
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        course: searchParams.get('course') || '',
        message: '',
    });

    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        const payload = {
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `New Admission Enquiry – ${form.course || 'Not specified'}`,
            from_name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email,
            phone: form.phone,
            course: form.course || 'Not specified',
            message: form.message || '—',
            // Friendly HTML email body
            botcheck: '',
        };

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setForm({ firstName: '', lastName: '', email: '', phone: '', course: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24 w-full max-w-[100vw] overflow-x-hidden text-slate-900 theme-light-section relative">

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
                        <span className="text-gradient">Admission</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Let's Shape Your Digital Future Together with Innovation Expertise
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* ── Left: Contact Info ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col justify-center"
                    >
                        <h3 className="text-3xl font-bold mb-6 text-slate-900">Get In Touch</h3>
                        <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                            Have questions about our programs, admissions, or how AI-powered marketing can boost your career?
                            Our team is here to guide you every step of the way.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-accent-blue" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-slate-900">Phone</h4>
                                    <a href="tel:+918590144794" className="text-slate-600 hover:text-accent-blue transition-colors font-medium">
                                        +91 8590 144 794
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-accent-cyan" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-slate-900">Email</h4>
                                    <a href="mailto:info@breathartinstitute.in" className="text-slate-600 hover:text-accent-blue transition-colors font-medium">
                                        info@breathartinstitute.in
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-200/50 border border-slate-300 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-slate-700" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-slate-900">Visit Us</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        Breathart Institute of Creative Technology (BICT)<br />
                                        Karthika Tower, Opposite Wedland Weddings,<br />
                                        Moonnumukku, Attingal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Right: Form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 blur-[50px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-blue/10 blur-[50px] -z-10" />

                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                            <span className="w-8 h-1 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full" />
                            Admission Enquiry Form
                        </h3>

                        {/* ── Success state ── */}
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                            >
                                <CheckCircle className="w-16 h-16 text-green-500" />
                                <h4 className="text-2xl font-bold text-slate-900">Enquiry Sent!</h4>
                                <p className="text-slate-600 max-w-xs">
                                    We've received your details and will get back to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm"
                                >
                                    Submit another enquiry
                                </button>
                            </motion.div>
                        )}

                        {/* ── Error banner ── */}
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                Something went wrong. Please try again or email us directly.
                            </motion.div>
                        )}

                        {/* ── Form (hidden after success) ── */}
                        {status !== 'success' && (
                            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                                {/* Honeypot anti-spam */}
                                <input type="checkbox" name="botcheck" className="hidden" />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="+91 0000 000000"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Course of Interest *</label>
                                    <select
                                        name="course"
                                        value={form.course}
                                        onChange={handleChange}
                                        className={inputClass + ' appearance-none cursor-pointer'}
                                        required
                                    >
                                        <option value="" disabled>Select a program</option>
                                        <option value="Master Diploma in AI Digital Marketing">Master Diploma in AI Digital Marketing</option>
                                        <option value="Diploma in AI Digital Marketing">Diploma in AI Digital Marketing</option>
                                        <option value="Certificate in Digital Marketing">Certificate in Digital Marketing</option>
                                        <option value="Diploma in Photography">Diploma in Photography</option>
                                        <option value="Diploma in Graphic Design">Diploma in Graphic Design</option>
                                        <option value="Diploma in Graphic Design & Photography">Diploma in Graphic Design &amp; Photography</option>
                                        <option value="Integrated Diploma in Creative Media">Integrated Diploma in Creative Media</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        className={inputClass + ' min-h-[120px] resize-none'}
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-lg hover:shadow-lg hover:shadow-accent-blue/30 transition-all flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            Submit Enquiry
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Admission;
