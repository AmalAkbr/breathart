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

const AccordionItem = ({ question }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex justify-between items-center text-left hover:text-accent-cyan transition-colors"
            >
                <span className="text-lg font-medium text-white">{question}</span>
                {isOpen ? <Minus className="text-accent-cyan flex-shrink-0" /> : <Plus className="text-slate-400 flex-shrink-0" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-slate-300 leading-relaxed">
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
        <section className="py-12 md:py-16 bg-gradient-to-b from-secondary to-primary relative">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-8 md:mb-12 text-white"
                >
                    Frequently Asked <span className="text-gradient">Questions</span>
                </motion.h2>

                <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl shadow-black/20 relative z-10">
                    {questions.map((q, i) => (
                        <AccordionItem key={i} question={q} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
