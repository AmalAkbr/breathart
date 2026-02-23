import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiquidChrome from '../components/LiquidChrome';

// Importing course images
import firstImg from '../assets/first.jpeg';
import secondImg from '../assets/second.png';
import thirdImg from '../assets/third.png';
import fourthImg from '../assets/fourth.png';
import lastImg from '../assets/last.png';

const courseData = [
    {
        title: "Master Diploma in AI Digital Marketing",
        category: "MARKETING COURSES",
        description: "An advanced, comprehensive course blending artificial intelligence tools with high-level digital marketing strategies.",
        learnings: [
            "AI-based Digital Marketing Tools & Automation",
            "Performance Marketing (Google & Meta Ads)",
            "Creative Strategy, Branding & Analytics",
            "Photography & Editing Basics for Marketers"
        ],
        duration: "4 Months",
        type: "Premium Course",
        image: firstImg
    },
    {
        title: "Diploma in AI Digital Marketing",
        category: "MARKETING COURSES",
        description: "Master the fundamentals of AI-powered digital marketing to rapidly grow brands and execute successful campaigns.",
        learnings: [
            "AI-powered Digital Marketing Fundamentals",
            "Social Media Marketing + Campaign Planning",
            "SEO Basics & Content Optimization",
            "Marketing Automation & Analytics"
        ],
        duration: "3 Months",
        type: "Certification",
        image: secondImg
    },
    {
        title: "Certificate in Digital Marketing",
        category: "MARKETING COURSES",
        description: "A fast-tracked program focused on essential marketing skills and immediate practical application.",
        learnings: [
            "Basics of Digital Marketing",
            "Google Ads & Meta Ads Setup",
            "Campaign Optimization & Reporting"
        ],
        duration: "2 Months",
        type: "Short Course",
        image: thirdImg
    },
    {
        title: "Diploma in Photography",
        category: "CREATIVE MEDIA COURSES",
        description: "Develop your visual eye and technical skills with hands-on training from industry professional photographers.",
        learnings: [
            "Professional Camera Handling",
            "Studio & Outdoor Lighting",
            "Portrait, Product & Lifestyle Photography",
            "Photo Editing & Retouching"
        ],
        duration: "3 Months",
        type: "Creative Program",
        image: fourthImg
    },
    {
        title: "Diploma in Graphic Design",
        category: "CREATIVE MEDIA COURSES",
        description: "Translate your creative vision into compelling visuals through comprehensive instruction in industry-standard design tools.",
        learnings: [
            "Design Principles & Typography",
            "Branding & Logo Design",
            "Social Media Creatives",
            "Print & Digital Marketing Materials"
        ],
        duration: "3 Months",
        type: "Creative Program",
        image: fourthImg
    },
    {
        title: "Integrated Diploma in Creative Media",
        category: "CREATIVE MEDIA COURSES",
        description: "A multidisciplinary course combining design, photography, and video creation for the complete digital artist.",
        learnings: [
            "Photography & Visual Composition",
            "Graphic Design & Branding",
            "Video & Social Media Content Creation",
            "AI Tools for Creative Workflow"
        ],
        duration: "6 Months",
        type: "Advanced Program",
        image: lastImg
    }
];

const CourseModule = ({ course, index }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-12 items-center mb-24 last:mb-0`}
        >
            <div className="w-full lg:w-1/2">
                <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-shadow duration-500 group border border-slate-200">
                    {course.image ? (
                        <>
                            <div className="w-full h-[350px] lg:h-[450px] overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-center p-8">
                                <span className="text-sm font-bold tracking-[0.2em] text-accent-cyan mb-4 uppercase">
                                    {course.category}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
                                        {course.title.split(' ')[0]}
                                    </span>
                                    <br />
                                    {course.title.split(' ').slice(1).join(' ')}
                                </h3>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Abstract background for course images */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 -z-10" />

                            {/* LiquidChrome Interactive Background */}
                            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-70 transition-opacity duration-700 mix-blend-multiply">
                                <LiquidChrome baseColor={[0, 0.4, 0.8]} speed={0.15} amplitude={0.6} />
                            </div>

                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 blur-[80px] rounded-full z-0" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 blur-[80px] rounded-full z-0" />

                            <div className="px-10 py-20 flex flex-col items-center justify-center text-center h-[350px] lg:h-[450px] relative z-10">
                                <span className="text-sm font-bold tracking-[0.2em] text-accent-blue mb-4 uppercase">
                                    {course.category}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 leading-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
                                        {course.title.split(' ')[0]}
                                    </span>
                                    <br />
                                    {course.title.split(' ').slice(1).join(' ')}
                                </h3>
                            </div>
                            <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <div className="mb-6 flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                        {course.type}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                        {course.duration}
                    </span>
                </div>

                <h3 className="text-3xl font-bold mb-4 text-slate-900">{course.title}</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {course.description}
                </p>

                <div className="mb-8">
                    <h4 className="text-sm font-bold tracking-wider text-slate-900 uppercase mb-4 border-b border-slate-200 pb-2 inline-block">
                        What You'll Learn
                    </h4>
                    <ul className="space-y-4">
                        {course.learnings.map((learning, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-6 h-6 text-accent-cyan flex-shrink-0 mt-0.5" />
                                <span className="text-slate-700 font-medium">{learning}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link to="/admission" className="inline-flex items-center gap-2 text-accent-blue font-bold hover:gap-4 transition-all w-fit group">
                    Enroll in this course
                    <ArrowRight className="w-5 h-5 group-hover:text-accent-cyan transition-colors" />
                </Link>
            </div >
        </motion.div >
    );
};

const CoursesPage = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24 w-full max-w-[100vw] overflow-x-hidden theme-light-section">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24 max-w-4xl mx-auto"
                >
                    <span className="text-accent-cyan font-bold tracking-[0.2em] uppercase mb-4 block">Our Programs</span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-8 text-slate-900 leading-tight">
                        The Future Marketer’s & <br className="hidden md:block" /> <span className="text-gradient">Creator's Toolkit</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Explore advanced programs that merge artificial intelligence with digital marketing and creative media, designed to equip you with the skills the industry demands today and tomorrow.
                    </p>
                </motion.div>

                {/* Courses List */}
                <div className="mt-12">
                    {courseData.map((course, index) => (
                        <CourseModule key={index} course={course} index={index} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default CoursesPage;
