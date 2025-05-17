/**
 * Header Component
 *
 * Main navigation header for the application. Includes:
 * - Application logo/title
 * - Navigation links
 * - Authentication state-dependent UI (sign in/up buttons or user dropdown)
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

/**
 * Header component with responsive navigation
 *
 * Displays different UI based on user authentication state:
 * - When authenticated: Shows username with dropdown menu (profile, logout)
 * - When not authenticated: Shows sign in and sign up buttons
 *
 * @returns {JSX.Element} Header component with navigation elements
 */
export const Header = () => {
  // Get authentication state and functions from context
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full border-b border-gray-800">
      <div className="container flex items-center justify-between py-4">
        {/* Application Logo/Title */}
        <Link to="/" className="text-xl font-bold text-white">
          Reportr
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          <Link to="/browse" className="text-sm text-gray-300 hover:text-white">
            Browse Reports
          </Link>
          <Link to="/new" className="text-sm text-gray-300 hover:text-white">
            Start a Report
          </Link>

          {/* Authentication-dependent UI */}
          {isAuthenticated ? (
            // User is authenticated - Show user dropdown menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-sm bg-transparent border-gray-700 hover:bg-gray-800"
                >
                  {user?.username || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-gray-900 border-gray-800 text-gray-200"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                {/* User profile link */}
                <Link to={`/profile/${user?.id}`}>
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 flex items-center gap-2">
                    <User size={16} />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-800" />
                {/* Logout button */}
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-gray-800 text-red-400 flex items-center gap-2"
                  onClick={() => logout()}
                >
                  <LogOut size={16} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is not authenticated - Show sign in/up buttons
            <>
              <Link
                to="/signin"
                className="text-sm text-gray-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="text-sm bg-transparent border-gray-700 hover:bg-gray-800"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
