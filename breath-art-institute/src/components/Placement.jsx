import { motion } from 'framer-motion';

const Placement = () => {
    return (
        <section className="py-16 md:py-20 bg-gradient-to-b from-secondary to-tertiary">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-heading font-bold mb-6 text-white"
                    >
                        Digital Marketing <span className="text-gradient">Placement Course</span> In Kerala
                    </motion.h2>
                    <p className="text-xl text-slate-300 mb-8">
                        Unlock exclusive internship opportunities with our UAE-based company partners.
                        Gain international exposure tailored to kickstart your global career.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
                    <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-2xl hover:border-accent-cyan/40 transition-colors shadow-lg shadow-black/20">
                        <h3 className="text-2xl font-bold mb-4 text-accent-cyan">Learn Digital Marketing Course From Agency Experts</h3>
                        <p className="text-slate-300">
                            Our curriculum is crafted and delivered by active industry professionals who are currently managing global campaigns. This ensures you learn what is working *now*, not outdated theories.
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-2xl hover:border-accent-blue/40 transition-colors shadow-lg shadow-black/20">
                        <h3 className="text-2xl font-bold mb-4 text-accent-blue">Why BICT Best Digital Marketing Academy In Kerala for Your Career</h3>
                        <p className="text-slate-300">
                            We offer a unique blend of creative technology and data-driven marketing strategies, backed by the strong network of the BreathArt Group in Dubai. Your career is our priority.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Placement;
