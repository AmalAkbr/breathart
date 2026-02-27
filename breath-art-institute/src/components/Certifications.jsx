import { motion } from 'framer-motion';

const Certifications = () => {
    return (
        <section className="py-20 relative bg-secondary -mt-[2px] z-10">
            {/* Wave Separator Top - transitions from the white courses section above */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] fill-white">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 mt-8 md:mt-10">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16 text-white">
                    Recognized <span className="text-gradient">Certifications</span>
                </h2>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        "Indira Gandhi National Education Trust (IGNET) Affiliation",
                        "BreathArt Institute Certificate",
                        "Meta Certificate"
                    ].map((cert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-gradient-to-br from-tertiary via-blue-950 to-black border border-white/10 p-8 rounded-xl flex flex-col items-center text-center group hover:border-accent-cyan/50 hover:bg-white/5 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-cyan/10"
                        >
                            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 border border-white/10 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                📜
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{cert}</h3>
                            <p className="text-slate-400 text-sm">Globally recognized validation of your skills.</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Certifications;
