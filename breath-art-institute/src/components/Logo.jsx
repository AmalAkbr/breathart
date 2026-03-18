const Logo = ({ className }) => {
    return (
        <img
            src="/app/institute.png"
            alt="BreathArt Institute Logo"
            className={`${className} object-contain`}
        />
    );
};

export default Logo;
