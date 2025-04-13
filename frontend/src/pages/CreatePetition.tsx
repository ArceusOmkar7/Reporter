
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { toast } from "sonner";

const CreatePetition = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send this data to an API
    console.log("Form submitted:", formData);
    toast.success("Petition created successfully!");
    navigate("/browse");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-10">
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Create a New Petition</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm mb-2">Title</label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a clear, specific title for your petition"
                  required
                  className="bg-black border-gray-700"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm mb-2">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue and what change you want to see"
                  rows={6}
                  required
                  className="bg-black border-gray-700"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm mb-2">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger className="bg-black border-gray-700 text-gray-400">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm mb-2">Location</label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Where is this issue located?"
                  required
                  className="bg-black border-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Upload Image (Optional)</label>
                <div className="border border-dashed border-gray-700 rounded-md p-4 text-center">
                  <Button type="button" variant="outline" className="bg-transparent border-gray-700 hover:bg-gray-800 text-sm">
                    Choose file
                  </Button>
                  <div className="mt-2 text-xs text-gray-400">No file chosen</div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent border-gray-700 hover:bg-gray-800"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Create Petition
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePetition;
