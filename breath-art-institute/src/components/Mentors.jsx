import { motion } from 'framer-motion';

// Importing mentor images
import prajithImg from '../assets/Photo-1.png';
import bipashaImg from '../assets/Photo-2.png';
import sonaImg from '../assets/Photo-3.png';
import gladsonImg from '../assets/Photo-4.png';
import adithImg from '../assets/Photo-1.png'; // No 5th photo found, using placeholder or reusing

const mentors = [
    { name: "Prajith Prakash", role: "Operations Manager", image: sonaImg },
    { name: "Bipasha M", role: "Business Development Manager", image: prajithImg },
    { name: "Sona T P", role: "Marketing Analyst", image: bipashaImg },
    { name: "Gladson", role: "Senior Photographer & Trainer", image: gladsonImg },
    { name: "Adith", role: "Graphic Designer" } // No image for Adith
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
                            className="flex flex-col items-center group cursor-pointer"
                        >
                            <div className="relative mb-6">
                                <div className={`w-28 h-28 md:w-36 md:h-36 z-10 relative flex items-center justify-center transition-all duration-500 overflow-hidden ${!mentor.image ? 'bg-slate-800/50 rounded-full group-hover:-translate-y-2 group-hover:drop-shadow-[0_10px_20px_rgba(6,182,212,0.3)]' : ''}`}>
                                    {mentor.image ? (
                                        <img
                                            src={mentor.image}
                                            alt={mentor.name}
                                            className="w-full h-full object-contain group-hover:-translate-y-2 group-hover:drop-shadow-[0_10px_20px_rgba(6,182,212,0.3)] transition-all duration-500"
                                        />
                                    ) : (
                                        <span className="text-5xl opacity-50">👤</span>
                                    )}
                                </div>
                                {/* Yellow/Accent background accent (optional background glow) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-accent-cyan/20 opacity-0 group-hover:opacity-100 blur-3xl group-hover:bg-accent-blue/40 group-hover:scale-150 transition-all duration-700 -z-10"></div>
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
