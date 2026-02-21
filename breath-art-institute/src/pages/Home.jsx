import Hero from '../components/Hero';
import PartnerLogos from '../components/PartnerLogos';
import About from '../components/About';
import VisionMission from '../components/VisionMission';
import Courses from '../components/Courses';
import Certifications from '../components/Certifications';
import Placement from '../components/Placement';
import Mentors from '../components/Mentors';
import FAQ from '../components/FAQ';

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
            <FAQ />
        </main>
    );
};

export default Home;
