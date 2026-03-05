import instituteLogo from '../assets/institute.png';

const Logo = ({ className, variant }) => {
    return (
        <img
            src={instituteLogo}
            alt="BreathArt Institute Logo"
            className={`${className} object-contain`}
        />
    );
};

export default Logo;
