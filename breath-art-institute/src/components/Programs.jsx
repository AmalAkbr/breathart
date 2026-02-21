import { motion } from 'framer-motion';

const programs = [
    {
        title: "Breathwork Facilitation",
        description: "Learn to guide others through transformative breathwork journeys.",
        icon: "🌬️"
    },
    {
        title: "Creative Flow Mastery",
        description: "Unlock your artistic potential by mastering your internal state.",
        icon: "🎨"
    },
    {
        title: "Somatic Healing",
        description: "Release trauma and tension through body-centered practices.",
        icon: "🧘"
    }
];

const Programs = () => {
    return (
        <section id="programs" className="py-16 md:py-20 relative">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">Our Programs</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto px-4">
                        Comprehensive training pathways designed for personal transformation and professional certification.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-tertiary via-blue-950/80 to-secondary border border-white/10 hover:border-accent-blue/50 transition-colors group shadow-lg shadow-black/20"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {program.icon}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">{program.title}</h3>
                            <p className="text-slate-300 mb-6">
                                {program.description}
                            </p>
                            <a href="#" className="text-accent-blue hover:text-white font-medium inline-flex items-center gap-2 transition-colors">
                                Learn more <span>→</span>
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Programs;
