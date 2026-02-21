import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const questions = [
    "Who we are?",
    "Why should I choose Breathart Institute?",
    "What courses does Breathart Institute offer?",
    "Who can apply for these courses?",
    "What skills will I gain?",
    "What career opportunities are available after completing a course?",
    "Do you provide placement support?",
    "Are the courses practical or theory-based?",
    "Will I get a certificate or diploma?",
    "Is there internship support?"
];

const AccordionItem = ({ question, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-accent-blue transition-colors"
            >
                <span className="text-lg font-medium text-slate-900">{question}</span>
                {isOpen ? <Minus className="text-accent-cyan" /> : <Plus className="text-slate-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-600 leading-relaxed">
                            Detailed answer regarding "{question}" goes here. At BreathArt Institute, we focus on providing comprehensive and practical knowledge to ensure our students are industry-ready.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    return (
        <section className="py-16 md:py-20 bg-white relative theme-light-section">
            {/* Zig Zag Top Border (using CSS mask or SVG) */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] fill-white">
                    <path d="M1200 120L0 16.48V0h1200v120z"></path>
                </svg>
            </div>

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 pt-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-10 md:mb-16 text-slate-900"
                >
                    Frequently Asked <span className="text-gradient">Questions</span>
                </motion.h2>

                <div className="max-w-3xl mx-auto bg-slate-50/80 backdrop-blur-md rounded-2xl p-8 border border-slate-200 shadow-xl shadow-black/5 relative z-10">
                    {questions.map((q, i) => (
                        <AccordionItem key={i} question={q} index={i} />
                    ))}
                </div>
            </div>

            {/* Wave Separator Bottom (curves into Location section) */}
            <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] fill-white rotate-180 scale-x-[-1]">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default FAQ;
