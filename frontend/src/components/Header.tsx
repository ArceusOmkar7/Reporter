/**
 * Header Component
 *
 * Main navigation header for the application. Includes:
 * - Application logo/title
 * - Navigation links
 * - Theme toggle switch
 * - Authentication state-dependent UI (sign in/up buttons or user dropdown)
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield } from "lucide-react";

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
    <header className="w-full border-b dark:border-gray-800 border-gray-200 dark:bg-gray-950 bg-white">
      <div className="container flex items-center justify-between py-4">
        {/* Application Logo/Title */}
        <Link
          to="/"
          className="text-xl font-bold dark:text-white text-gray-900"
        >
          Reporter
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          <Link
            to="/browse"
            className="text-sm dark:text-gray-300 text-gray-600 hover:dark:text-white hover:text-gray-900"
          >
            Browse Reports
          </Link>
          <Link
            to="/new"
            className="text-sm dark:text-gray-300 text-gray-600 hover:dark:text-white hover:text-gray-900"
          >
            Start a Report
          </Link>
          <ThemeToggle />{" "}
          {/* Added ThemeToggle here as it's part of the header but was missing in the provided snippet */}
          {/* Authentication-dependent UI */}
          {isAuthenticated ? (
            // User is authenticated - Show user dropdown menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-sm bg-transparent dark:border-gray-700 border-gray-300 dark:hover:bg-gray-800 hover:bg-gray-100 dark:text-gray-100 text-gray-900"
                >
                  {user?.username || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 dark:bg-gray-900 bg-white dark:border-gray-800 border-gray-200 dark:text-gray-200 text-gray-800"
              >
                <DropdownMenuLabel className="dark:text-gray-100 text-gray-900">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-800 bg-gray-200" />
                {/* User profile link */}
                <Link to={`/profile/${user?.id}`}>
                  <DropdownMenuItem className="cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-100 flex items-center gap-2 dark:text-gray-300 text-gray-700 hover:dark:text-white hover:text-gray-900">
                    <User size={16} />
                    Profile
                  </DropdownMenuItem>
                </Link>
                {/* Admin Dashboard link - only show for administrators */}
                {user?.role === "Administrator" && (
                  <>
                    <DropdownMenuSeparator className="dark:bg-gray-800 bg-gray-200" />
                    <Link to="/admin/dashboard">
                      <DropdownMenuItem className="cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-100 flex items-center gap-2 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300">
                        <Shield size={16} />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator className="dark:bg-gray-800 bg-gray-200" />
                {/* Logout button */}
                <DropdownMenuItem
                  className="cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-100 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
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
                className="text-sm dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="text-sm bg-transparent dark:border-gray-700 border-gray-300 dark:hover:bg-gray-800 hover:bg-gray-100 dark:text-gray-100 text-gray-900"
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
