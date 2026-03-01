import { motion } from 'framer-motion';
import Grainient from '../components/Grainient';
import photographyImage from '../assets/photography.webp';
import instituteImage from '../assets/institute.webp';
import marketingImage from '../assets/marketing.webp';
import bgImage from '../assets/bg.webp';
import RotatingText from '../components/RotatingText';
import Aurora from '../components/Aurora';

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
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 leading-tight text-slate-900 flex flex-col items-center">
                        <div>Best Digital Marketing Academy</div>
                        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mt-2 overflow-hidden">
                            <motion.span
                                layout
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2, layout: { type: "spring", damping: 25, stiffness: 200 } }}
                                className="inline-block font-medium"
                            >
                                Powered by
                            </motion.span>
                            <RotatingText
                                texts={['AI', 'UAE Expertise']}
                                mainClassName="text-accent-cyan drop-shadow-sm font-bold tracking-tight inline-flex"
                                staggerFrom="center"
                                staggerDuration={0.025}
                                rotationInterval={3500}
                                initial={{ y: '70%', opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: '-70%', opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 22, stiffness: 220, mass: 0.6 }}
                            />
                        </div>
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
                    className="rounded-3xl relative overflow-hidden"
                >
                    {/* Background Image & Overlay — scoped to the card */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <div className="absolute inset-0 bg-[#0f172a]/95 z-0" />
                    <Aurora colorStops={['#000000', '#06b6d4', '#ffffff']} amplitude={1.2} />
                    <div className="absolute inset-0 bg-slate-900/40 z-[5]" />

                    <div className="relative z-10 p-8 md:p-12 lg:p-16">
                        <div className="flex flex-col lg:flex-row gap-6 md:gap-12 lg:gap-16 items-center lg:items-center">
                            {/* Images Row (mobile: horizontal row on top, desktop: vertical column on left) */}
                            <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto lg:max-w-[120px] justify-center">
                                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-full lg:h-auto flex-shrink-0">
                                    <img src={photographyImage} alt="Photography Studio" loading="lazy" decoding="async" className="w-full h-auto object-contain" />
                                </div>
                                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-full lg:h-auto flex-shrink-0">
                                    <img src={instituteImage} alt="Education Institute" loading="lazy" decoding="async" className="w-full h-auto object-contain" />
                                </div>
                                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-full lg:h-auto flex-shrink-0">
                                    <img src={marketingImage} alt="Digital Marketing" loading="lazy" decoding="async" className="w-full h-auto object-contain" />
                                </div>
                            </div>

                            {/* Text Column */}
                            <div className="flex flex-col justify-center text-left flex-1">
                                <h3 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">BreathArt Group</h3>

                                <div className="space-y-4 md:space-y-6 text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
                                    <p>
                                        <strong className="text-accent-cyan font-bold">BreathArt Group</strong> is a UAE-based creative and business group offering a complete ecosystem of AI-powered digital marketing, branding solutions, education institutes, professional photography studios, and business consultancy services.
                                    </p>
                                    <p>
                                        Founded in 2024 in the United Arab Emirates, BreathArt Group has expanded its operations to India and global markets, supporting brands and individuals across multiple industries. Our integrated approach helps businesses achieve strong online visibility, high-quality lead generation, and long-term brand growth.
                                    </p>
                                    <p>
                                        With a growing international presence, we have successfully served more than <strong className="text-white">500 happy clients worldwide</strong>, delivering measurable results and creating new business opportunities every month across the globe.
                                    </p>
                                    <p className="text-lg md:text-xl text-slate-200 font-medium mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20">
                                        At BreathArt Group, we focus on transforming companies into brands by combining strategic marketing, creative innovation, advanced AI solutions, and industry-focused education.
                                    </p>
                                </div>
                            </div>
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
