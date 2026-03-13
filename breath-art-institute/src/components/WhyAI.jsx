import { motion } from 'framer-motion';
import { Target, Lightbulb, Zap, Rocket, Award } from 'lucide-react';
import whiteeImage from '../assets/whitee.webp';

const WhyAI = () => {
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

    const benefits = [
        {
            icon: <Award className="w-6 h-6 md:w-8 md:h-8" />,
            text: "Gain in-demand skills for global careers",
            color: "from-blue-500 to-indigo-500"
        },
        {
            icon: <Lightbulb className="w-6 h-6 md:w-8 md:h-8" />,
            text: "Solve complex problems with smart solutions",
            color: "from-cyan-500 to-blue-500"
        },
        {
            icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
            text: "Work efficiently with automation and data-driven insights",
            color: "from-indigo-500 to-cyan-500"
        },
        {
            icon: <Target className="w-6 h-6 md:w-8 md:h-8" />,
            text: "Stay ahead in the fast-evolving digital world",
            color: "from-blue-600 to-cyan-600"
        }
    ];

    return (
        <section className="relative z-20 px-4 md:px-8 lg:px-12 py-12 md:py-16 w-full bg-white theme-light-section overflow-hidden border-y border-slate-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img src={whiteeImage} alt="Background pattern" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/90" />
            </div>

            {/* Glowing Accents */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 bg-accent-blue/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
                >
                    {/* Left side: Heading and Intro */}
                    <div className="w-full lg:w-5/12 text-center lg:text-left">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 text-accent-blue font-bold text-xs md:text-sm mb-6 md:mb-8 shadow-sm">
                            <Rocket className="w-4 h-4" /> <span>Future-Proof Your Career</span>
                        </motion.div>
                        
                        <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-slate-900 leading-[1.15] font-heading">
                            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-blue">AI</span> is Important for the Future
                        </motion.h2>
                        
                        <motion.p variants={fadeInUp} className="text-sm md:text-base text-slate-600 leading-relaxed font-medium mb-6">
                            Artificial Intelligence is no longer just a buzzword—it's driving the global economy. Mastering AI gives you the leverage to excel in any industry.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="hidden lg:block">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0f172a] text-white shadow-xl border border-slate-700/50 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Rocket className="w-8 h-8 text-accent-cyan mb-4" />
                                <p className="text-lg font-bold leading-tight relative z-10">Learn AI today and prepare for the careers of tomorrow! 🌍🚀</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side: Benefits List */}
                    <div className="w-full lg:w-7/12">
                        <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                            {benefits.map((item, index) => (
                                <motion.div 
                                    key={index}
                                    variants={fadeInUp}
                                    className="bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80 hover:border-accent-cyan/20 transition-all duration-300 group"
                                >
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300 ease-out`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-cyan group-hover:to-accent-blue transition-colors">
                                        {item.text}
                                    </h3>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Mobile CTA (visible only on small screens) */}
                        <motion.div variants={fadeInUp} className="mt-8 lg:hidden">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0f172a] text-white shadow-xl text-center border border-slate-700/50">
                                <p className="text-lg font-bold leading-tight flex flex-col items-center gap-2">
                                    <Rocket className="w-6 h-6 text-accent-cyan" />
                                    Learn AI today and prepare for the careers of tomorrow! 🌍🚀
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default WhyAI;
