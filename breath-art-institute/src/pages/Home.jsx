import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';

// Eagerly loaded: Hero is the LCP element, must render immediately
// Everything below the fold is lazy-loaded — downloaded only when needed

const PartnerLogos = lazy(() => import('../components/PartnerLogos'));
const About = lazy(() => import('../components/About'));
const VisionMission = lazy(() => import('../components/VisionMission'));
const Courses = lazy(() => import('../components/Courses'));
const Certifications = lazy(() => import('../components/Certifications'));
const Placement = lazy(() => import('../components/Placement'));
const Mentors = lazy(() => import('../components/Mentors'));
const DigitalMarketingCareer = lazy(() => import('../components/DigitalMarketingCareer'));
const ToolsCovered = lazy(() => import('../components/ToolsCovered'));
const HappyClients = lazy(() => import('../components/HappyClients'));
const FAQ = lazy(() => import('../components/FAQ'));
const Location = lazy(() => import('../components/Location'));

// Invisible fallback — preserves scroll position/layout while chunk loads
const SectionLoader = () => <div style={{ minHeight: '200px' }} aria-hidden="true" />;

const Home = () => {
    return (
        <main>
            {/* Hero renders immediately — it is the LCP element */}
            <Hero />

            {/* All below-fold sections are lazily loaded */}
            <Suspense fallback={<SectionLoader />}>
                <PartnerLogos />
                <About />
                <VisionMission />
                <Courses />
                <Certifications />
                <Placement />
                <Mentors />
                <DigitalMarketingCareer />
                <ToolsCovered />
                <HappyClients />
                <FAQ />
                <Location />
            </Suspense>
        </main>
    );
};

export default Home;
