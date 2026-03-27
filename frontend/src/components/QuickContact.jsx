import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, ArrowRight, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import insta from '../assets/instagram.webp';
import face from '../assets/facebook.webp';

const QuickContact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        const formData = new FormData(e.target);
        formData.append("access_key", "5c42dcb8-f7ac-4753-a3ca-16f5f7006633");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus('success');
                e.target.reset(); // Clear the form
                setTimeout(() => setSubmitStatus(null), 5000); // Reset success message after 5s
            } else {
                console.error("Form submission failed:", data);
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative w-full py-16 px-4 md:px-8 lg:px-12 bg-white overflow-hidden border-y border-slate-200 z-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[300px] bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between bg-white/60 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 md:p-12 shadow-2xl">

                    {/* Left: Text Content & Small Contact Cards */}
                    <div className="flex-1 text-center lg:text-left flex flex-col justify-center">

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight"
                        >
                            Ready to Upgrade Your <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-blue">Digital Career?</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-600 text-base md:text-lg max-w-xl mx-auto lg:mx-0 mb-8"
                        >
                            Speak directly with our expert career counselors. We'll help you find the perfect training path mapped exactly to market demands.
                        </motion.p>

                        {/* Smaller Contact Cards under text */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                            <motion.a
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                href="tel:+918590144794"
                                className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-accent-cyan/50 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Direct Line</p>
                                    <p className="text-slate-900 font-bold text-sm lg:text-base leading-none">+91 8590 144 794</p>
                                </div>
                            </motion.a>

                            <motion.a
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=info@breathartinstitute.in" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-accent-blue/50 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Email Support</p>
                                    <p className="text-slate-900 font-bold text-sm lg:text-base leading-none">info@breathartinstitute.in</p>
                                </div>
                            </motion.a>
                        </div>

                        {/* Social Links Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 mt-6 justify-center lg:justify-start"
                        >
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mr-2">Connect:</span>

                            <a href="https://wa.me/918590144794" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:scale-110 transition-all group overflow-hidden drop-shadow-md">
                                <svg className="w-6 h-6 text-slate-500 group-hover:text-green-500 transition-colors z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>

                            <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:scale-110 transition-all overflow-hidden drop-shadow-md">
                                <img src={insta} alt="Instagram" className="w-6 h-6 object-cover" />
                            </a>

                            <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:scale-110 transition-all overflow-hidden drop-shadow-md">
                                <img src={face} alt="Facebook" className="w-6 h-6 object-cover" />
                            </a>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="w-full lg:w-[400px] xl:w-[450px] shrink-0"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="relative bg-[#0a192f] backdrop-blur-2xl p-6 md:p-8 rounded-2xl border border-accent-blue/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(0,180,255,0.15)] flex flex-col gap-4 overflow-hidden"
                        >
                            {/* Inner Glass Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 relative z-10">Request Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-[#112240] text-white border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent-cyan/50 focus:bg-[#1a2f55]/50 transition-colors text-sm disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Mobile Number"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-[#112240] text-white border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent-cyan/50 focus:bg-[#1a2f55]/50 transition-colors text-sm disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-[#112240] text-white border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent-cyan/50 focus:bg-[#1a2f55]/50 transition-colors text-sm disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <select
                                        name="course"
                                        defaultValue=""
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-[#112240] text-slate-300 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent-cyan/50 focus:bg-[#1a2f55]/50 transition-colors text-sm appearance-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="" disabled>Interested Course</option>
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
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || submitStatus === 'success'}
                                className={`w-full mt-2 group relative flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold text-sm rounded-xl overflow-hidden transition-all duration-300 ${submitStatus === 'success'
                                    ? 'bg-green-500'
                                    : submitStatus === 'error'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-gradient-to-r from-accent-cyan to-accent-blue hover:shadow-lg hover:shadow-accent-cyan/20'
                                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isSubmitting ? (
                                        <>Sending... <Loader2 className="w-4 h-4 animate-spin" /></>
                                    ) : submitStatus === 'success' ? (
                                        <>Sent Successfully! <CheckCircle2 className="w-4 h-4" /></>
                                    ) : submitStatus === 'error' ? (
                                        <>Submission Failed - Try Again</>
                                    ) : (
                                        <>Submit Request <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </span>
                            </button>
                            <p className="text-[10px] text-slate-500 text-center mt-2">
                                We'll never share your information with anyone else.
                            </p>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default QuickContact;
