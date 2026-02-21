import { motion } from 'framer-motion';

const VisionMission = () => {
    return (
        <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-secondary via-tertiary to-secondary">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                <div className="grid md:grid-cols-2 gap-8 md:gap-16">

                    {/* Vision */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative p-8 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group hover:border-accent-cyan/40 transition-colors shadow-lg shadow-black/20"
                    >
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-cyan/10 rounded-full blur-3xl group-hover:bg-accent-cyan/20 transition-colors" />

                        <h3 className="text-3xl font-heading font-bold text-white">VISION <br /><span className="text-lg text-accent-cyan font-normal uppercase tracking-wider">Shaping Future Leaders</span></h3>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            To become the global benchmark in AI-powered creative education, producing world-class digital professionals capable of leading the future economy from Kerala to the world stage.
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative p-8 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group hover:border-accent-blue/40 transition-colors shadow-lg shadow-black/20"
                    >
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-blue/10 rounded-full blur-3xl group-hover:bg-accent-blue/20 transition-colors" />

                        <h3 className="text-3xl font-heading font-bold text-white">MISSION <br /><span className="text-lg text-accent-blue font-normal uppercase tracking-wider">Empowering the World</span></h3>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            To bridge creativity and technology through agency-based, real-world training so every student gains international-grade skills, mentorship, and placement support to thrive globally.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default VisionMission;
