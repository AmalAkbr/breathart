import { motion } from 'framer-motion';
import crs1 from '../assets/crs1.png';
import crs2 from '../assets/crs2.png';
import SplitText from './SplitText';

const CourseCard = ({ title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        style={{ willChange: "transform, opacity" }}
        className="bg-gradient-to-br from-white to-blue-100/40 border border-slate-200 p-8 rounded-2xl hover:border-accent-cyan/50 transition-all shadow-md hover:shadow-xl group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 blur-3xl -z-0 pointer-events-none transform-gpu will-change-transform"></div>
        <h3 className="text-xl font-heading font-bold mb-4 text-slate-900 group-hover:text-accent-cyan transition-colors relative z-10">{title}</h3>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed relative z-10">{description}</p>
        <button className="w-full py-3 rounded-lg border border-accent-cyan text-accent-cyan font-medium hover:bg-accent-cyan hover:text-white transition-all">
            Enroll Now
        </button>
    </motion.div>
);

const Courses = () => {
    return (
        <section id="courses" className="py-16 md:py-20 bg-white theme-light-section">
            <div className="container mx-auto px-4 md:px-6">

                {/* Section Title */}
                <div className="text-center mb-16 lg:mb-20 pt-8">
                    <span className="text-accent-blue font-bold tracking-wider uppercase mb-3 block">Expert-Led Curriculum</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tight">
                        <SplitText text="Explore Our Premium Courses" delay={40} splitType="words" duration={0.8} rootMargin="-50px" />
                    </h2>
                </div>

                {/* Digital Marketing Block */}
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-20">
                    <div className="relative h-[250px] md:h-[400px] rounded-2xl border border-slate-200 overflow-hidden group shadow-xl shadow-accent-cyan/10 lg:order-2">
                        <img
                            src={crs1}
                            alt="Advanced Digital Marketing Course"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 transform-gpu"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{ willChange: "transform, opacity" }}
                        className="lg:order-1"
                    >
                        <span className="text-accent-cyan font-bold tracking-wider uppercase mb-2 block">Premium Course</span>
                        <h2 className="text-4xl font-heading font-bold mb-6 text-slate-900">
                            Kerala's First AI-Powered <br /> <span className="text-gradient">Digital Marketing</span> & Creative Institute!
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Join BreathArt Institute's 4-Month Advanced Digital Marketing Course in Trivandrum with live online or offline classes. Master the art of digital dominance with AI integration.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {['Live Industry Expert Faculties', '100% Placement Assistance', 'Soft-skill training', 'Latest industry innovations', 'Brand Collaborations'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <span className="w-5 h-5 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="bg-gradient-to-r from-accent-cyan to-accent-blue text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-accent-cyan/40 transition-all transform-gpu hover:-translate-y-1">
                            Enroll Now
                        </button>
                    </motion.div>
                </div>

                {/* Creative Education Block */}
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-20">
                    <div className="relative h-[250px] md:h-[400px] rounded-2xl border border-slate-200 overflow-hidden group lg:order-1 shadow-xl shadow-accent-blue/10">
                        <img
                            src={crs2}
                            alt="Creative Education"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 transform-gpu"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{ willChange: "transform, opacity" }}
                        className="lg:order-2"
                    >
                        <span className="text-accent-blue font-bold tracking-wider uppercase mb-2 block">Skill Development</span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-slate-900 break-words">
                            CREATIVE <span className="text-gradient">EDUCATION</span>
                        </h2>
                        <p className="text-slate-600 mb-6 break-words whitespace-normal">
                            Learn not just how to design, but how to turn your creativity into results. Our curriculum is designed to bridge the gap between artistic talent and market demands.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {['Industry Experts', 'Practical Learning', 'Regular Class Timings', 'Live Industry Exposure'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <span className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-xs">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="bg-gradient-to-r from-accent-blue to-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-accent-blue/40 transition-all transform-gpu hover:-translate-y-1">
                            Enroll Now
                        </button>
                    </motion.div>
                </div>

                {/* Specific Course Cards */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    <CourseCard
                        title="Master In AI Digital Marketing"
                        description="An advanced course that blends AI and digital marketing strategies to create future-ready marketers. Master tools like ChatGPT, Midjourney, and data analytics."
                        delay={0}
                    />
                    <CourseCard
                        title="Diploma In Digital Marketing"
                        description="A practical course that teaches you how to run ads, manage social media, and optimize SEO. Perfect for beginners looking to start a career."
                        delay={0.2}
                    />
                    <CourseCard
                        title="Diploma In Graphic Design & Photography"
                        description="Become a skilled photographer and Graphic designer. Learn Adobe Creative Suite, composition, and visual storytelling techniques."
                        delay={0.4}
                    />
                </div>

            </div >
        </section >
    );
};

export default Courses;
