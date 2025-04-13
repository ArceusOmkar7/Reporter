
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Check } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would validate and send this data to an API
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    console.log("Form submitted:", formData);
    toast.success("Account created successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container max-w-md mx-auto px-4 py-10">
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-xs mb-1">First Name</label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="bg-black border-gray-700"
                  />
                </div>
                
                <div>
                  <label htmlFor="middleName" className="block text-xs mb-1">Middle Name</label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="bg-black border-gray-700"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-xs mb-1">Last Name</label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="bg-black border-gray-700"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs mb-1">Email</label>
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
                <label htmlFor="phone" className="block text-xs mb-1">Phone Number</label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="bg-black border-gray-700"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs mb-1">Password</label>
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
              
              <div>
                <label htmlFor="confirmPassword" className="block text-xs mb-1">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-black border-gray-700"
                />
              </div>
              
              <Button type="submit" className="w-full mt-4 bg-white text-black hover:bg-gray-200">
                Sign Up
              </Button>
              
              <div className="text-center text-sm text-gray-400 mt-4">
                Already have an account? <Link to="/signin" className="text-white underline">Sign in</Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
