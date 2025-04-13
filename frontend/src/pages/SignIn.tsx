
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Check } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would validate and send this data to an API
    console.log("Form submitted:", formData);
    toast.success("Signed in successfully!");
    navigate("/");
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
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="me@example.com"
                    required
                    className="bg-black border-gray-700 pr-10"
                  />
                  {formData.email.includes("@") && (
                    <Check size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label htmlFor="password" className="block text-sm">Password</label>
                  <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-white">
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
              
              <Button type="submit" className="w-full mt-4 bg-white text-black hover:bg-gray-200">
                Sign In
              </Button>
              
              <div className="text-center text-sm text-gray-400 mt-4">
                Don't have an account? <Link to="/signup" className="text-white underline">Sign up</Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
