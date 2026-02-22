import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const BlogModal = ({ blog, onClose }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!blog) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="flex flex-col gap-4 p-8 border-b border-slate-100 bg-slate-50/50 pr-16 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-accent-cyan text-sm font-bold uppercase tracking-wider">{blog.category}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-slate-500 text-sm font-medium">{blog.date}</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 leading-tight">
                        {blog.title}
                    </h2>
                </div>

                {/* Content Section (Scrollable) */}
                <div className="p-8 overflow-y-auto w-full custom-scrollbar flex-1 bg-white">
                    <div className="prose prose-lg prose-slate max-w-none">
                        {blog.content ? (
                            blog.content.map((paragraph, idx) => (
                                <p key={idx} className="text-slate-600 leading-relaxed mb-6 last:mb-0">
                                    {paragraph}
                                </p>
                            ))
                        ) : (
                            <p className="text-slate-600 leading-relaxed">
                                {blog.summary}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Gradient Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </motion.div>
        </motion.div>
    );
};

export default BlogModal;
