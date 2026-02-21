import { motion } from 'framer-motion';

const mentors = [
    { name: "Prajith Prakash", role: "Operations Manager" },
    { name: "Bipasha M", role: "Business Development Manager" },
    { name: "Sona T P", role: "Marketing Analyst" },
    { name: "Gladson", role: "Senior Photographer & Trainer" },
    { name: "Adith", role: "Graphic Designer" }
];

const Mentors = () => {
    return (
        <section className="py-16 md:py-20 relative bg-gradient-to-b from-secondary via-tertiary to-secondary">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl font-heading font-bold mb-16 text-white"
                >
                    OUR <span className="text-gradient">MENTORS</span>
                </motion.h2>

                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {mentors.map((mentor, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center group"
                        >
                            <div className="relative mb-4">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-accent-cyan/50 z-10 relative bg-secondary">
                                    {/* Placeholder generic avatar */}
                                    <div className="w-full h-full bg-gradient-to-br from-secondary to-accent-blue/20 flex items-center justify-center text-4xl">
                                        👤
                                    </div>
                                </div>
                                {/* Yellow/Accent background accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-yellow-500/20 -z-0 blur-xl group-hover:bg-accent-cyan/40 transition-colors duration-300 transform translate-x-2 -translate-y-2"></div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-cyan transition-colors">{mentor.name}</h3>
                            <p className="text-slate-400 text-sm">{mentor.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Mentors;
