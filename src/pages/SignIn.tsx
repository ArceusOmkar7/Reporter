/**
 * Sign In Page
 *
 * This page allows users to authenticate with their credentials.
 * Features:
 * - Username and password form
 * - Form validation
 * - Error handling with toast notifications
 * - Navigation after successful login
 * - Link to sign up page for new users
 * - Option to login as admin
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * SignIn component handles user authentication
 *
 * @returns {JSX.Element} The sign in page component
 */
const SignIn = () => {
  const navigate = useNavigate();
  const { login, logout, user } = useAuth();
  const [loginType, setLoginType] = useState<"user" | "admin">("user");

  // Form state for username and password
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // Loading state for submission feedback
  const [loading, setLoading] = useState(false);

  /**
   * Update form data when input fields change
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission for sign in
   * Attempts to authenticate the user and navigates on success
   *
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Authenticate user with the auth context
      const userData = await login({
        username: formData.username,
        password: formData.password,
      });

      // Check if the user is trying to access admin section
      if (loginType === "admin") {
        // Check if the user has admin role
        if (userData.role !== "Administrator") {
          toast.error("You don't have admin privileges. Access denied.");
          logout(); // Log them out since they don't have admin access
          setLoading(false);
          return;
        }

        // User is confirmed admin, redirect to dashboard
        toast.success("Signed in successfully as admin!");
        navigate("/admin/dashboard");
      } else {
        // Regular user login
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
      {/* Global header navigation */}
      <Header />

      {/* Main content area */}
      <main className="flex-1 container max-w-md mx-auto px-4 py-10 flex items-center justify-center">
        <div className="dark:bg-gray-800/60 bg-gray-50 dark:border dark:border-gray-700/60 border border-gray-200 rounded-lg p-8 w-full shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

          {/* Login type selector */}
          <div className="text-center text-sm text-muted-foreground mb-4">
            For testing purposes, use admin credentials: <br />
            Username: <strong>abhinav_hazarika</strong> <br />
            Password: <strong>password123</strong>
          </div>
          <Tabs
            defaultValue="user"
            className="mb-6"
            onValueChange={(value) => setLoginType(value as "user" | "admin")}
          >
            <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700/50 bg-gray-200 dark:text-gray-300 text-gray-700">
              <TabsTrigger
                value="user"
                className="data-[state=active]:dark:bg-gray-900 data-[state=active]:bg-white data-[state=active]:dark:text-white data-[state=active]:text-black"
              >
                User Login
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:dark:bg-gray-900 data-[state=active]:bg-white data-[state=active]:dark:text-white data-[state=active]:text-black"
              >
                Admin Login
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm mb-1 dark:text-gray-300 text-gray-700"
                >
                  Username
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter Username"
                    required
                    className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                  />
                  {/* Show checkmark when username is entered */}
                  {formData.username && (
                    <Check
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    />
                  )}
                </div>
              </div>

              {/* Password field without forgot password link */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm mb-1 dark:text-gray-300 text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                />
              </div>

              {/* Submit button with loading state */}
              <Button
                type="submit"
                className="w-full mt-4 dark:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-gray-500 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : `Sign In as ${loginType === "admin" ? "Admin" : "User"}`}
              </Button>

              {/* Link to sign up page - show only for user login */}
              {loginType === "user" && (
                <div className="text-center text-sm dark:text-gray-400 text-gray-500 mt-4">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="dark:text-blue-400 text-blue-600 underline dark:hover:text-blue-300 hover:text-blue-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
