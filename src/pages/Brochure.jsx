import { motion } from 'framer-motion';
import { FileDown, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import B1 from '../assets/B1.pdf';
import B2 from '../assets/B2.pdf';

const brochures = [
    {
        id: 1,
        title: 'Creative Media Programs',
        subtitle: 'Photography, Design & Media',
        description:
            'Dive into our creative media offerings — photography, graphic design, and integrated media diplomas — that shape world-class visual storytellers.',
        highlights: [
            'Diploma in Photography',
            'Diploma in Graphic Design',
            'Integrated Diploma in Creative Media',
        ],
        icon: <GraduationCap className="w-7 h-7" />,
        gradient: 'linear-gradient(135deg, #3b82f6, #a855f7)',
        file: B2,
        filename: 'BICT-Creative-Media-Brochure.pdf',
    },
    {
        id: 2,
        title: 'Digital Marketing Programs',
        subtitle: 'AI-Powered Marketing Courses',
        description:
            'Explore our complete lineup of AI Digital Marketing programs — from short certificates to advanced master diplomas — and find the course that matches your goals.',
        highlights: [
            'Master Diploma in AI Digital Marketing',
            'Diploma in AI Digital Marketing',
            'Certificate in Digital Marketing',
        ],
        icon: <BookOpen className="w-7 h-7" />,
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        file: B1,
        filename: 'BICT-Digital-Marketing-Brochure.pdf',
    },
];

const BrochureCard = ({ brochure, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500"
    >
        {/* Top gradient bar */}
        <div style={{ background: brochure.gradient }} className="h-1.5 w-full" />

        <div className="p-8 md:p-10 pt-10 md:pt-12 flex flex-col h-full">
            {/* Icon + heading */}
            <div className="flex items-center gap-10 mb-6">
                <div
                    style={{ background: brochure.gradient }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                >
                    {brochure.icon}
                </div>
                <div>
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-1">
                        {brochure.subtitle}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 leading-tight">
                        {brochure.title}
                    </h2>
                </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {brochure.description}
            </p>

            {/* Highlights */}
            <ul className="space-y-3 mb-10 flex-1">
                {brochure.highlights.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <span
                            style={{ background: brochure.gradient }}
                            className="w-2 h-2 rounded-full flex-shrink-0"
                        />
                        {item}
                    </li>
                ))}
            </ul>

            {/* Download button */}
            <div className="mt-auto pt-6">
                <a
                    href={brochure.file}
                    download={brochure.filename}
                    style={{ background: brochure.gradient }}
                    className="inline-flex items-center gap-3 w-full justify-center py-4 rounded-2xl text-white font-bold text-lg hover:shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-[1.02] active:scale-100"
                >
                    <FileDown className="w-5 h-5" />
                    Download Brochure
                </a>
            </div>
        </div>
    </motion.div>
);

const Brochure = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24 w-full max-w-[100vw] overflow-x-hidden text-slate-900 theme-light-section">
            <div className="w-full max-w-[1300px] mx-auto px-4 md:px-12 lg:px-16">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 max-w-3xl mx-auto"
                >
                    <span className="text-accent-cyan font-bold tracking-[0.2em] uppercase mb-4 block text-sm">
                        Course Brochures
                    </span>
                    <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-slate-900 leading-tight">
                        Download Our{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
                            Program Guides
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Get a detailed overview of our courses, curriculum, fees, and placement support —
                        all in one convenient PDF.
                    </p>
                </motion.div>

                {/* ── Cards Grid ── */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-16">
                    {brochures.map((b, i) => (
                        <BrochureCard key={b.id} brochure={b} index={i} />
                    ))}
                </div>

                {/* ── CTA Banner ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(59,130,246,0.12))',
                        border: '1px solid rgba(59,130,246,0.25)',
                    }}
                    className="mt-28 rounded-3xl p-10 md:p-16 flex flex-col items-center text-center"
                >
                    <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-3">
                        Ready to Take the Next Step?
                    </h3>
                    <p className="text-slate-600 text-base mb-10 max-w-xl leading-relaxed">
                        Have questions about a program? Our admissions team is here to help you choose the right course for your career.
                    </p>
                    <Link
                        to="/admission"
                        style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.03] group"
                    >
                        Apply Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

            </div>
        </div>
    );
};

export default Brochure;
