import { motion } from 'framer-motion';
import { Download, FileText, ChevronRight, BookOpen, ArrowRight } from 'lucide-react';
import B1 from '../assets/B1.pdf';
import B2 from '../assets/B2.pdf';

const Brochure = () => {
    const brochures = [
        {
            id: 1,
            title: "Creative Media Brochure",
            subtitle: "Creative Education & Professional Skills",
            file: B1,
            description: "Learn about BreathArt Institute's vision, our range of creative courses, and how we transform students into industry-ready professionals.",
            features: ["Industry Expert Mentors", "Creative Portfolios", "State-of-the-art Infrastructure"],
            color: "from-blue-600 to-indigo-600"
        },
        {
            id: 2,
            title: "Digital Marketing Brochure",
            subtitle: "Master Diploma in AI Digital Marketing",
            file: B2,
            description: "Explore our most comprehensive digital marketing program featuring AI-driven strategies, practical agency training, and international expertise.",
            features: ["AI-Powered Curriculum", "Practical Agency Training", "100% Placement Support"],
            color: "from-indigo-600 to-purple-600"
        }
    ];

    return (
        <div className="pt-24 min-h-screen bg-slate-50 theme-light-section">
            {/* Hero Section */}
            <section className="relative py-28 overflow-hidden">
                {/* Soft background accents for light mode */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1800px] h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] bg-blue-100/40 blur-[130px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] bg-indigo-50/50 blur-[130px] rounded-full" />
                </div>

                <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1.5 px-5 rounded-full bg-blue-600/5 border border-blue-600/10 text-blue-600 text-sm font-bold uppercase tracking-widest mb-6">
                            Resources & Guides
                        </span>
                        <h1 className="text-5xl md:text-7xl font-heading font-black mb-8 text-slate-900 tracking-tight">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Brochures</span>
                        </h1>
                        <p className="text-slate-500 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                            Download our detailed program guides to understand the curriculum,
                            learning outcomes, and career opportunities waiting for you at BreathArt Institute.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Brochure Cards */}
            <section className="pb-32">
                <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {brochures.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                                className="group relative"
                            >
                                {/* Clean, high-contrast card for light mode */}
                                <div className="absolute inset-0 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm group-hover:shadow-2xl group-hover:shadow-blue-900/5 group-hover:border-blue-200 transition-all duration-500" />

                                <div className="relative p-10 md:p-14 flex flex-col h-full">
                                    <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${item.color} p-0.5 mb-10 shadow-lg shadow-blue-600/20`}>
                                        <div className="w-full h-full bg-white rounded-[1.15rem] flex items-center justify-center">
                                            <BookOpen className="w-7 h-7 text-blue-600" />
                                        </div>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-blue-600 font-bold mb-8 tracking-wide uppercase text-sm">{item.subtitle}</p>

                                    <p className="text-slate-500 mb-10 leading-relaxed text-lg font-medium">
                                        {item.description}
                                    </p>

                                    <div className="space-y-4 mb-12 flex-grow">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Key Highlights</p>
                                        <div className="space-y-4">
                                            {item.features.map(feat => (
                                                <div key={feat} className="flex items-center gap-4 text-slate-600 list-none">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-base font-semibold">{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-5 mt-auto">
                                        <a
                                            href={item.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all rounded-[1.25rem] text-slate-900 font-bold text-base group/btn"
                                        >
                                            <FileText className="w-5 h-5 opacity-70 group-hover/btn:scale-110 transition-transform" />
                                            View Online
                                        </a>
                                        <a
                                            href={item.file}
                                            download
                                            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] transition-all rounded-[1.25rem] text-white font-bold text-base group/btn"
                                        >
                                            <Download className="w-5 h-5 group-hover/btn:translate-y-0.5 transition-transform" />
                                            Download PDF Guide
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Wide CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-24 p-12 md:p-20 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 relative overflow-hidden text-center"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 blur-[100px] -z-10" />

                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">Ready to Begin Your Career?</h2>
                        <p className="text-slate-500 mb-12 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                            Join thousands of successful professionals who started their journey at BreathArt.
                            Our counselors are ready to help you choose the right path.
                        </p>
                        <div className="flex flex-wrap justify-center gap-5">
                            <a
                                href="https://wa.me/918590144794"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-[#25D366] text-white font-bold text-lg hover:shadow-xl hover:shadow-green-500/30 transition-all active:scale-[0.98]"
                            >
                                Chat via WhatsApp
                            </a>
                            <a
                                href="/admission"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-black transition-all active:scale-[0.98]"
                            >
                                Apply Online Now <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Brochure;
