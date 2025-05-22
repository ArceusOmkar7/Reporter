import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        email: formData.email,
        contactNumber: formData.phone,
      });

      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 container max-w-md mx-auto px-4 py-10">
        <div className="dark:bg-gray-800/60 bg-gray-50 dark:border dark:border-gray-700/60 border border-gray-200 rounded-lg p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Create an Account
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                  >
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="middleName"
                    className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                  >
                    Middle Name
                  </label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                  >
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
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
                    className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900 pr-10"
                  />
                  {formData.username && formData.username.length > 3 && (
                    <Check
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="me@example.com"
                    required
                    className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900 pr-10"
                  />
                  {formData.email.includes("@") && (
                    <Check
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  required
                  className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                />
                {formData.password && (
                  <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs mb-1 dark:text-gray-300 text-gray-700"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-300 dark:focus:border-blue-500 focus:border-blue-500 dark:text-gray-100 text-gray-900"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4 dark:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-gray-500 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm dark:text-gray-400 text-gray-500 mt-4">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="dark:text-blue-400 text-blue-600 underline dark:hover:text-blue-300 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
