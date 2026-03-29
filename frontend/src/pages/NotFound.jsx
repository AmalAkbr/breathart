// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      
      <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        404
      </h1>

      <p className="text-xl md:text-2xl font-semibold mb-3">
        You’re in the wrong place 👀
      </p>

      <p className="text-gray-400 max-w-md mb-8">
        The page you’re looking for doesn’t exist, was moved, or never existed in the first place.
      </p>

      <Link
        to="/"
        replace
        className="px-6 py-3 rounded-xl bg-accent-cyan text-black font-semibold hover:scale-105 transition-transform duration-200"
      >
        Take me home →
      </Link>
      
    </div>
  );
};

export default NotFound;