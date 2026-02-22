import { motion } from 'framer-motion';
import Grainient from '../components/Grainient';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24 w-full max-w-[100vw] overflow-x-hidden theme-light-section">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-12 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 leading-tight text-slate-900">
                        Best Digital Marketing Academy<br />
                        Powered by <span className="text-gradient">AI UAE Expertise</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
                        Join the best digital marketing academy in Attingal. Learn SEO, Google Ads & social media marketing with expert trainers. Enroll today!
                    </p>
                    <p className="mt-6 text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
                        Learn the art of digital marketing where artificial intelligence meets UAE-specific expertise. Our institute prepares you with industry-ready skills for today's competitive market.
                    </p>
                </motion.div>

                {/* Content Sections */}
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="text-3xl font-bold mb-6 text-slate-900 border-l-4 border-accent-cyan pl-4">
                            What We Stand For
                        </h3>
                        <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                            <p>
                                In today's fast-evolving digital landscape, the demand for skilled digital marketing professionals has surged—outpacing supply by over 59% in 2025. Choosing the right institute is crucial for launching a successful career in this high-growth industry.
                            </p>
                            <p>
                                At BICT Academy, Attingal, we bridge the skills gap with a future-ready, agency-based training model that replicates real-world marketing scenarios. Whether you come from a technical or non-technical background, our curriculum is designed to empower students from all educational streams.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="border border-white/20 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl"
                    >
                        {/* Grainient Background for this specific module */}
                        <Grainient />

                        <div className="relative z-10">
                            <h4 className="text-2xl font-bold mb-6 text-white">Here's what sets us apart:</h4>
                            <p className="text-slate-200 mb-8 text-lg font-medium">
                                Discover the unique blend of AI innovation and UAE expertise that makes our digital marketing institute stand out.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30 backdrop-blur-sm">
                                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xl text-white mb-2">Comprehensive Digital Marketing Curriculum</h5>
                                        <p className="text-slate-200">Master every aspect of the digital landscape with an up-to-date and robust syllabus.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30 backdrop-blur-sm">
                                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xl text-white mb-2">Expert Mentorship from UAE-Based Professionals</h5>
                                        <p className="text-slate-200">Learn directly from industry leaders active in the competitive UAE market.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* BreathArt Group Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-xl"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-blue" />

                    <div className="text-center max-w-4xl mx-auto">
                        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">BreathArt Group</h3>

                        <div className="space-y-6 text-slate-600 text-lg leading-relaxed text-left md:text-center">
                            <p>
                                <strong className="text-accent-cyan font-bold">BreathArt Group</strong> is a UAE-based creative and business group offering a complete ecosystem of AI-powered digital marketing, branding solutions, education institutes, professional photography studios, and business consultancy services.
                            </p>
                            <p>
                                Founded in 2024 in the United Arab Emirates, BreathArt Group has expanded its operations to India and global markets, supporting brands and individuals across multiple industries. Our integrated approach helps businesses achieve strong online visibility, high-quality lead generation, and long-term brand growth.
                            </p>
                            <p>
                                With a growing international presence, we have successfully served more than <strong className="text-slate-900">500 happy clients worldwide</strong>, delivering measurable results and creating new business opportunities every month across the globe.
                            </p>
                            <p className="text-xl text-slate-800 font-medium mt-8 pt-8 border-t border-slate-200">
                                At BreathArt Group, we focus on transforming companies into brands by combining strategic marketing, creative innovation, advanced AI solutions, and industry-focused education.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mt-24"
                >
                    <h3 className="text-2xl md:text-3xl font-bold mb-8 text-slate-900 max-w-3xl mx-auto leading-snug">
                        Join Kerala's First International-Standard Marketing Institute and future-proof your career with the <span className="text-gradient hover:scale-105 inline-block transition-transform cursor-pointer">BICT advantage.</span>
                    </h3>
                    <a href="/admission" className="inline-block bg-gradient-to-r from-accent-cyan to-accent-blue text-white px-8 md:px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-accent-cyan/30 transition-all transform hover:-translate-y-1">
                        Apply Now
                    </a>
                </motion.div>

            </div>
        </div>
    );
};

export default AboutUs;
