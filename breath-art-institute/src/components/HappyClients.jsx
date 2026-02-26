import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const HappyClients = () => {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-bg-dark via-bg-mid to-bg-dark">
            {/* Background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-cyan/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan/25 rounded-full px-5 py-2">
                        <Globe className="w-4 h-4 text-accent-cyan" />
                        <span className="text-accent-cyan text-sm font-bold tracking-widest uppercase">Global Presence</span>
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight text-center mb-12"
                >
                    500+ Happy Clients{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
                        Across the Globe
                    </span>
                </motion.h2>

                {/* Content card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
                >
                    <p className="text-slate-200 text-lg md:text-xl leading-relaxed mb-8">
                        At <span className="text-accent-cyan font-semibold">BreathArt Digital Marketing Agency</span>, we are
                        proud to have served <span className="text-white font-bold">500+ happy clients across the globe</span>.
                        From startups to established enterprises, our digital marketing strategies have helped businesses grow
                        their online presence, generate quality leads, and increase revenue.
                    </p>
                    <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                        Our global client base reflects our commitment to <span className="text-slate-200 font-medium">quality</span>,{' '}
                        <span className="text-slate-200 font-medium">transparency</span>, and{' '}
                        <span className="text-slate-200 font-medium">measurable results</span>. No matter where your business is
                        located, BreathArt delivers performance-driven digital marketing solutions tailored to your goals.
                    </p>

                    {/* CTA */}
                    <div className="mt-10 pt-8 border-t border-white/10 flex justify-end">
                        <a
                            href="/admission"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-cyan to-accent-blue text-white px-8 py-3 rounded-full font-bold text-sm hover:shadow-xl hover:shadow-accent-cyan/25 hover:-translate-y-0.5 transition-all shrink-0"
                        >
                            Start Your Journey
                            <Globe className="w-4 h-4" />
                        </a>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default HappyClients;
