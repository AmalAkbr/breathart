import { motion } from 'framer-motion';

const blogs = [
    {
        title: "Start Your Journey with the Best Digital Marketing Academy in Attingal Today",
        date: "February 20, 2026",
        summary: "The digital world is transforming at a rapid pace. Businesses are moving from traditional to digital-first models, creating a massive demand for skilled SEO and digital marketing professionals.",
        category: "Career Guidance"
    },
    {
        title: "Best Digital Marketing Courses in Attingal with 100% Practical Training",
        date: "February 16, 2026",
        summary: "In a world of constant digital change, theory isn't enough. Our courses focus on hands-on experience, ensuring you achieve real results for real brands.",
        category: "Training"
    },
    {
        title: "Enroll at the Best Digital Marketing Academy in Attingal for 100% Practical Learning",
        date: "February 13, 2026",
        summary: "Practical learning is the backbone of success in digital marketing. We provide the tools and mentorship needed to master tools like Google Ads and Meta Business Suite.",
        category: "Academy"
    },
    {
        title: "Career Opportunities in Kerala After Completing a Digital Marketing Course",
        date: "February 5, 2026",
        summary: "Kerala's startup ecosystem is booming. From Kochi to Trivandrum, brands are looking for experts who can navigate the digital landscape effectively.",
        category: "Industry News"
    }
];

const Blogs = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24 w-full max-w-[100vw] overflow-x-hidden theme-light-section">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-slate-900">
                        Digital Marketing <span className="text-gradient">Blogs</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Stay updated with the latest trends, tips, and insights from the world of digital marketing.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {blogs.map((blog, index) => (
                        <motion.article
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-accent-cyan/50 hover:shadow-xl shadow-md transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-accent-cyan text-sm font-bold uppercase tracking-wider">{blog.category}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-slate-500 text-sm">{blog.date}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-accent-cyan transition-colors">
                                {blog.title}
                            </h3>
                            <p className="text-slate-600 mb-6 flex-grow">
                                {blog.summary}
                            </p>
                            <div className="mt-auto">
                                <button className="text-accent-cyan font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                    Read More <span>→</span>
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
