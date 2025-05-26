import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 bg-gray-100">
      <div className="text-center p-8 dark:bg-gray-800/50 bg-white/70 shadow-xl rounded-lg">
        <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">404</h1>
        <p className="text-xl dark:text-gray-300 text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="dark:text-blue-400 text-blue-600 dark:hover:text-blue-300 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
