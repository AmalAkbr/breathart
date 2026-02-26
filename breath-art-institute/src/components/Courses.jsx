import { useState } from 'react';
import { Link } from 'react-router-dom';
import crs1 from '../assets/crs1.webp';
import crs2 from '../assets/crs2.webp';
import EnrollModal from './EnrollModal';

const CourseCard = ({ title, description }) => (
    <div className="bg-gradient-to-br from-secondary via-slate-900/80 to-primary border border-white/10 p-8 rounded-2xl hover:border-accent-cyan/50 transition-all shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-accent-cyan/20 group relative overflow-hidden flex flex-col h-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/20 blur-3xl -z-0 pointer-events-none"></div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white group-hover:text-accent-cyan transition-colors relative z-10">{title}</h3>
        <p className="text-slate-300 mb-6 text-sm leading-relaxed relative z-10 flex-grow">{description}</p>
        <Link
            to={`/admission?course=${encodeURIComponent(title)}`}
            className="w-full py-3 mt-auto rounded-lg border border-accent-cyan text-accent-cyan font-medium hover:bg-accent-cyan hover:text-white transition-all relative z-10 text-center block"
        >
            Enroll Now
        </Link>
    </div>
);

const Courses = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');

    const openEnroll = (course = '') => {
        setSelectedCourse(course);
        setModalOpen(true);
    };
    const closeEnroll = () => setModalOpen(false);

    return (
        <section id="courses" className="py-16 md:py-20 bg-white theme-light-section">
            <div className="container mx-auto px-4 md:px-6">

                {/* Section Title */}
                <div className="text-center mb-16 lg:mb-20 pt-8">
                    <span className="text-accent-blue font-bold tracking-wider uppercase mb-3 block">Expert-Led Curriculum</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tight">
                        Explore Our Premium Courses
                    </h2>
                </div>

                {/* Premium Courses Cards Grid */}
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20">

                    {/* Card 1: Digital Marketing */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg flex flex-col h-full">
                        <div className="w-full h-48 sm:h-56 lg:h-64 shrink-0">
                            <img src={crs1} alt="Advanced Digital Marketing Course" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                            <span className="text-accent-cyan font-bold tracking-wider uppercase mb-2 block text-sm">Premium Course</span>
                            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-slate-900 leading-tight uppercase">
                                ADVANCED <span className="text-gradient">DIGITAL MARKETING</span>
                            </h2>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                Join BreathArt Institute's 4-Month Advanced Digital Marketing Course in Trivandrum with live online or offline classes. Master the art of digital dominance with AI integration.
                            </p>
                            <ul className="space-y-2 mb-6 flex-grow">
                                {['Live Industry Expert Faculties', '100% Placement Assistance', 'Soft-skill training', 'Latest industry innovations', 'Brand Collaborations'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 font-medium text-sm">
                                        <span className="w-5 h-5 mt-0.5 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0 text-xs">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => openEnroll('Advanced Digital Marketing')}
                                className="w-full py-3 bg-gradient-to-r from-accent-cyan to-accent-blue text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-accent-cyan/30 hover:-translate-y-0.5 transition-all mt-auto"
                            >
                                Enroll Now
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Creative Education */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg flex flex-col h-full">
                        <div className="w-full h-48 sm:h-56 lg:h-64 shrink-0">
                            <img src={crs2} alt="Creative Education" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                            <span className="text-accent-blue font-bold tracking-wider uppercase mb-2 block text-sm">Skill Development</span>
                            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-slate-900 leading-tight">
                                CREATIVE <span className="text-gradient">EDUCATION</span>
                            </h2>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed break-words whitespace-normal">
                                Learn not just how to design, but how to turn your creativity into results. Our curriculum is designed to bridge the gap between artistic talent and market demands.
                            </p>
                            <ul className="space-y-2 mb-6 flex-grow">
                                {['Industry Experts', 'Practical Learning', 'Regular Class Timings', 'Live Industry Exposure'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 font-medium text-sm">
                                        <span className="w-5 h-5 mt-0.5 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue shrink-0 text-xs">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => openEnroll('Creative Education')}
                                className="w-full py-3 bg-gradient-to-r from-accent-blue to-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-accent-blue/30 hover:-translate-y-0.5 transition-all mt-auto"
                            >
                                Enroll Now
                            </button>
                        </div>
                    </div>

                </div>

                {/* Specific Course Cards */}
                <div className="text-center mb-10 md:mb-14">
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
                        Digital Marketing Course In Kerala
                    </h3>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    <CourseCard
                        title="Master Diploma in AI Digital Marketing"
                        description="An advanced course that blends AI and digital marketing strategies to create future-ready marketers. Master tools like ChatGPT, Midjourney, and data analytics."
                    />
                    <CourseCard
                        title="Diploma in AI Digital Marketing"
                        description="A practical course that teaches you how to run ads, manage social media, and optimize SEO. Perfect for beginners looking to start a career."
                    />
                    <CourseCard
                        title="Diploma in Graphic Design & Photography"
                        description="Become a skilled photographer and Graphic designer. Learn Adobe Creative Suite, composition, and visual storytelling techniques."
                    />
                </div>

            </div>

            {/* Enroll Modal */}
            <EnrollModal
                key={selectedCourse}
                open={modalOpen}
                onClose={closeEnroll}
                defaultCourse={selectedCourse}
            />
        </section>
    );
};

export default Courses;
