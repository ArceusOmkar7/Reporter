
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="w-full border-b border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold text-white">
          PetitionHub
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/browse" className="text-sm text-gray-300 hover:text-white">
            Browse Petitions
          </Link>
          <Link to="/new" className="text-sm text-gray-300 hover:text-white">
            Start a Petition
          </Link>
          <Link to="/signin" className="text-sm text-gray-300 hover:text-white">
            Sign In
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="text-sm bg-transparent border-gray-700 hover:bg-gray-800">
              Sign Up
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
