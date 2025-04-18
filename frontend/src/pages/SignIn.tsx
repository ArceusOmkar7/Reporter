import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });

      toast.success("Signed in successfully!");
      navigate("/");
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container max-w-md mx-auto px-4 py-10 flex items-center justify-center">
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8 w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm mb-1">
                  Username
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    required
                    className="bg-black border-gray-700 pr-10"
                  />
                  {formData.username && (
                    <Check
                      size={16}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label htmlFor="password" className="block text-sm">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-black border-gray-700"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-white text-black hover:bg-gray-200"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-gray-400 mt-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-white underline">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
