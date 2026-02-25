import { motion } from 'framer-motion';

const Placement = () => {
    return (
        <section className="py-12 md:py-20 relative overflow-hidden bg-white theme-light-section">
            {/* Background Decorators - Subtle and Light */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-100/40 rounded-full blur-[80px] pointer-events-none transform-gpu" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[80px] pointer-events-none transform-gpu" />

            {/* Very faint dotted pattern for texture */}
            <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-[0.02] pointer-events-none" style={{ filter: 'invert(1)' }} />

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
                        <p>At BreathArt, we understand that every business is unique. That’s why we create tailored digital marketing strategies designed to meet your specific goals, target audience, and industry needs. From startups to established enterprises, we help brands build a strong online presence and achieve long-term success.</p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                        className="group relative h-full"
                    >
                        {/* Shadow layer that intensifies on hover */}
                        <div className="absolute inset-0 bg-blue-500/10 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 scale-95 group-hover:scale-100 group-hover:translate-y-4" />

                        {/* Card Background - Blue Shade */}
                        <div className="relative h-full bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200/60 p-8 lg:p-10 rounded-[1.5rem] transition-all duration-500 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.08)] group-hover:shadow-[0_15px_40px_-20px_rgba(0,180,216,0.2)] group-hover:border-blue-300/80 group-hover:-translate-y-1.5 flex flex-col z-10 overflow-hidden">
                            {/* Decorative top gradient line */}
                            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cyan-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

                            <div className="w-14 h-14 rounded-xl bg-white text-cyan-600 flex items-center justify-center mb-6 shadow-sm border border-white/50 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                </svg>
                            </div>

                            <h3 className="text-xl lg:text-2xl font-bold mb-3 text-slate-900 group-hover:text-cyan-700 transition-colors">Learn Digital Marketing Course From Agency Experts</h3>
                            <p className="text-slate-600 leading-relaxed text-base flex-grow">
                                Our curriculum is crafted and delivered by active industry professionals who are currently managing global campaigns. This ensures you learn what is working <span className="font-semibold text-slate-900">right now</span>, not outdated theories.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15, type: "spring", bounce: 0.2 }}
                        className="group relative h-full"
                    >
                        {/* Shadow layer that intensifies on hover */}
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 scale-95 group-hover:scale-100 group-hover:translate-y-4" />

                        {/* Card Background - Indigo Shade */}
                        <div className="relative h-full bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200/60 p-8 lg:p-10 rounded-[1.5rem] transition-all duration-500 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.08)] group-hover:shadow-[0_15px_40px_-20px_rgba(0,8,245,0.2)] group-hover:border-indigo-300/80 group-hover:-translate-y-1.5 flex flex-col z-10 overflow-hidden">
                            {/* Decorative top gradient line */}
                            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

                            <div className="w-14 h-14 rounded-xl bg-white text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-white/50 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-5.493-1.59-1.591M12 18.75V21m-5.834-.166 1.591-1.591" />
                                </svg>
                            </div>

                            <h3 className="text-xl lg:text-2xl font-bold mb-3 text-slate-900 group-hover:text-blue-700 transition-colors">Why BICT Best Digital Marketing Academy In Kerala for Your Career</h3>
                            <p className="text-slate-600 leading-relaxed text-base flex-grow">
                                We offer a unique blend of creative technology and data-driven marketing strategies, backed by the strong network of the BreathArt Group in Dubai. Your career is our priority.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Placement;
