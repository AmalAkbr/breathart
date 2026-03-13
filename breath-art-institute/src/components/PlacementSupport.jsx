import { motion } from 'framer-motion';
import { Globe2, Briefcase, Plane, TrendingUp, CheckCircle2 } from 'lucide-react';
import globeBg from '../assets/bg3.jpeg';

const PlacementSupport = () => {
    // Shared animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const features = [
        {
            icon: <Globe2 className="w-5 h-5" />,
            title: "Global Network",
            desc: "Connections with top agencies worldwide."
        },
        {
            icon: <Briefcase className="w-5 h-5" />,
            title: "Interview Prep",
            desc: "Mock interviews by industry experts."
        },
        {
            icon: <TrendingUp className="w-5 h-5" />,
            title: "Portfolio Building",
            desc: "Showcase real-world agency projects."
        },
        {
            icon: <Plane className="w-5 h-5" />,
            title: "Abroad Placements",
            desc: "Specialized guidance for jobs in UAE & beyond."
        }
    ];

    return (
        <section className="relative z-20 w-full py-12 md:py-16 bg-[#0a0f1a] overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <img src={globeBg} alt="Background" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80" />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
                >
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan font-bold text-xs md:text-sm mb-6 shadow-sm w-fit backdrop-blur-sm">
                            <Globe2 className="w-4 h-4" /> <span>Global Career Path</span>
                        </motion.div>

                        <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-white leading-tight font-heading">
                            Dedicated <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-blue">Placement Support</span> 🌍🚀
                        </motion.h2>

                        <motion.p variants={fadeInUp} className="text-sm md:text-base lg:text-lg text-slate-300 leading-relaxed font-medium mb-6">
                            We guide and train our students to secure job opportunities in global markets. Our powerful placement support program is specifically designed to attract and thoroughly prepare students looking for highly rewarding jobs abroad.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 gap-3 lg:gap-4 mb-6">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-cyan/30 transition-all group backdrop-blur-sm">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 flex items-center justify-center shrink-0 border border-white/5 text-accent-cyan group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">{feature.title}</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <a href="#courses" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-sm md:text-base hover:shadow-lg hover:shadow-accent-cyan/25 hover:-translate-y-1 transition-all">
                                Explore Our Programs
                            </a>
                        </motion.div>
                    </div>

                    {/* Right Content - Visuals */}
                    <div className="w-full lg:w-1/2 relative lg:h-[520px] flex items-center justify-center lg:justify-end">
                        <motion.div 
                            variants={fadeInUp} 
                            className="relative w-full max-w-lg aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-full rounded-3xl bg-gradient-to-br from-slate-800/80 to-[#0a192f] border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col justify-between"
                        >
                            <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-[0.05] pointer-events-none" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/20 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">100% Placement Assistance</h3>
                                <p className="text-slate-400 text-sm">Your success is our ultimate goal.</p>
                            </div>

                            <div className="relative z-10 space-y-4 mt-8">
                                {[
                                    "Resume & Portfolio Optimization",
                                    "LinkedIn Profile Makeover",
                                    "1-on-1 Career Counseling",
                                    "Direct Agency Referrals"
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                                        <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <span className="text-white font-medium">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default PlacementSupport;
