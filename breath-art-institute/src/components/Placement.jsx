import { motion } from 'framer-motion';
import experts from '../assets/experts.jpeg';
import career from '../assets/career.jpeg';

const Placement = () => {
    return (
        <section className="py-12 md:py-20 relative overflow-hidden bg-white theme-light-section">
            {/* Background Decorators - Subtle and Light */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-100/40 rounded-full blur-[80px] pointer-events-none transform-gpu" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[80px] pointer-events-none transform-gpu" />

            {/* Very faint dotted pattern for texture */}
            <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-[0.02] pointer-events-none invert" />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-block py-1 px-3 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 font-semibold text-xs tracking-wide mb-4 uppercase shadow-sm"
                    >
                        Global Opportunities
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-4 text-slate-900 leading-tight tracking-tight"
                    >
                        Best Digital Marketing Agency in Kerala – <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 line-clamp-none py-1">BreathArt</span>
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-slate-600 mb-6 max-w-3xl mx-auto leading-relaxed space-y-4 text-justify md:text-center"
                    >
                        <p>BreathArt Digital Marketing Agency is a results-driven digital marketing agency in Kerala, helping businesses and entrepreneurs grow their brand, leads, and sales through powerful online marketing strategies. We specialize in delivering customized digital solutions that focus on real growth, not just visibility.</p>
                        <p>At BreathArt, we understand that every business is unique. That's why we create tailored digital marketing strategies designed to meet your specific goals, target audience, and industry needs. From startups to established enterprises, we help brands build a strong online presence and achieve long-term success.</p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    <div className="relative h-full">
                        {/* Card Background - Blue Shade */}
                        <div className="relative h-full bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200/60 p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_-15px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center sm:items-stretch gap-6 lg:gap-8 z-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cyan-400 to-blue-500" />

                            <div className="w-full sm:w-2/5 aspect-square rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/50 overflow-hidden shrink-0">
                                <img src={experts} alt="Experts" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </div>

                            <div className="w-full sm:w-3/5 flex flex-col justify-center">
                                <h3 className="text-xl lg:text-2xl font-bold mb-3 text-slate-900">Learn Digital Marketing Course From Agency Experts</h3>
                                <p className="text-slate-600 leading-relaxed text-base">
                                    Our curriculum is crafted and delivered by active industry professionals who are currently managing global campaigns. This ensures you learn what is working <span className="font-semibold text-slate-900">right now</span>, not outdated theories.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-full">
                        {/* Card Background - Indigo Shade */}
                        <div className="relative h-full bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200/60 p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_-15px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center sm:items-stretch gap-6 lg:gap-8 z-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-indigo-500" />

                            <div className="w-full sm:w-2/5 aspect-square rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/50 overflow-hidden shrink-0">
                                <img src={career} alt="Career" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </div>

                            <div className="w-full sm:w-3/5 flex flex-col justify-center">
                                <h3 className="text-xl lg:text-2xl font-bold mb-3 text-slate-900">Why BICT Best Digital Marketing Academy In Kerala for Your Career</h3>
                                <p className="text-slate-600 leading-relaxed text-base">
                                    We offer a unique blend of creative technology and data-driven marketing strategies, backed by the strong network of the BreathArt Group in Dubai. Your career is our priority.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Placement;
