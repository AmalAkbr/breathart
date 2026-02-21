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
        <div className="border-b border-white/10 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-accent-cyan transition-colors"
            >
                <span className="text-lg font-medium text-white">{question}</span>
                {isOpen ? <Minus className="text-accent-cyan" /> : <Plus className="text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-300 leading-relaxed">
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
        <section className="py-16 md:py-20 bg-secondary relative">
            {/* Zig Zag Top Border (using CSS mask or SVG) */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] fill-secondary">
                    <path d="M1200 120L0 16.48V0h1200v120z"></path>
                </svg>
            </div>

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 pt-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-10 md:mb-16 text-white"
                >
                    Frequently Asked <span className="text-gradient">Questions</span>
                </motion.h2>

                <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    {questions.map((q, i) => (
                        <AccordionItem key={i} question={q} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
