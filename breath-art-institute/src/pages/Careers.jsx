import { motion } from 'framer-motion';
import StarBorder from '../components/StarBorder';

const jobs = [
    {
        title: "Video Editor",
        goal: "To craft compelling visual stories that engage the audience and convey brand messages effectively.",
        responsibilities: [
            "Editing high-quality video content for social media and marketing.",
            "Collaborating with the creative team to conceptualize visual stories.",
            "Keeping up with the latest trends in video production and editing software."
        ],
        type: "Full-time / Part-time"
    },
    {
        title: "Customer Care Executive",
        goal: "To be the primary point of contact for students and clients, ensuring high satisfaction and smooth communication.",
        responsibilities: [
            "Handling student inquiries and providing detailed course information.",
            "Managing bookings and follow-ups for potential leads.",
            "Resolving customer queries and feedback efficiently."
        ],
        type: "Full-time"
    }
];

const Careers = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24 w-full max-w-[100vw] overflow-x-hidden theme-light-section">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-slate-900">
                        Build Your <span className="text-gradient">Career</span> With Us
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Join our team of creative professionals and help shape the future of digital marketing education.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="h-full"
                        >
                            <StarBorder as="div" color="#1ec3cc" speed="4s" className="h-full rounded-2xl block">
                                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-accent-blue/40 transition-all shadow-md hover:shadow-xl flex flex-col h-full relative z-10 w-full">
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="text-2xl font-bold text-slate-900">{job.title}</h3>
                                            <span className="bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-accent-blue/20">
                                                {job.type}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-accent-cyan font-bold text-sm uppercase mb-2">Role Goal</h4>
                                            <p className="text-slate-600">{job.goal}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-accent-cyan font-bold text-sm uppercase mb-4">Key Responsibilities</h4>
                                            <ul className="space-y-3">
                                                {job.responsibilities.map((resp, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />
                                                        {resp}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <button className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold hover:shadow-lg hover:shadow-accent-cyan/20 transition-all">
                                        Apply Now
                                    </button>
                                </div>
                            </StarBorder>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Careers;
