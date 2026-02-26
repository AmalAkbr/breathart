import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';

const Admission = () => {
    const [searchParams] = useSearchParams();
    const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
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
                        Let’s Shape Your Digital Future Together with Innovation Expertise
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column - Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col justify-center"
                    >
                        <h3 className="text-3xl font-bold mb-6 text-slate-900">
                            Get In Touch
                        </h3>
                        <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                            Have questions about our programs, admissions, or how AI-powered marketing can boost your career? Our team is here to guide you every step of the way. We would like to speak with you. Feel free to reach out using the below details.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-accent-blue" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-slate-900">Phone</h4>
                                    <a href="tel:+918590144794" className="text-slate-600 hover:text-accent-blue transition-colors font-medium">
                                        +91 8590144794
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

                    {/* Right Column - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 blur-[50px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-blue/10 blur-[50px] -z-10" />

                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                            <span className="w-8 h-1 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full"></span>
                            Admission Enquiry Form
                        </h3>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">First Name *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address *</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                    placeholder="+91 0000 000000"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Course of Interest *</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all appearance-none cursor-pointer"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="" disabled selected>Select a program</option>
                                    <option value="Master Diploma in AI Digital Marketing" className="bg-white">Master Diploma in AI Digital Marketing</option>
                                    <option value="Diploma in AI Digital Marketing" className="bg-white">Diploma in AI Digital Marketing</option>
                                    <option value="Certificate in Digital Marketing" className="bg-white">Certificate in Digital Marketing</option>
                                    <option value="Diploma in Photography" className="bg-white">Diploma in Photography</option>
                                    <option value="Diploma in Graphic Design" className="bg-white">Diploma in Graphic Design</option>
                                    <option value="Integrated Diploma in Creative Media" className="bg-white">Integrated Diploma in Creative Media</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all min-h-[120px] resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-lg hover:shadow-lg hover:shadow-accent-blue/30 transition-all flex items-center justify-center gap-2 group mt-6">
                                Submit Enquiry
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Admission;
