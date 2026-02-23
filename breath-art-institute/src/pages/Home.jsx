import Hero from '../components/Hero';
import PartnerLogos from '../components/PartnerLogos';
import About from '../components/About';
import VisionMission from '../components/VisionMission';
import Courses from '../components/Courses';
import Certifications from '../components/Certifications';
import Placement from '../components/Placement';
import Mentors from '../components/Mentors';
import DigitalMarketingCareer from '../components/DigitalMarketingCareer';
import FAQ from '../components/FAQ';
import Location from '../components/Location';

const Home = () => {
    return (
        <main>
            <Hero />
            <PartnerLogos />
            <About />
            <VisionMission />
            <Courses />
            <Certifications />
            <Placement />
            <Mentors />
            <DigitalMarketingCareer />
            <FAQ />
            <Location />
        </main>
    );
};

export default Home;
