import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ReportCard } from "@/components/ReportCard";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const initialPetitionsData = [
  {
    id: 1,
    title: "Fix the potholes on Main Street",
    description:
      "The potholes on Main Street have been causing damage to vehicles and are a safety hazard.",
    location: "Main Street, Downtown",
    category: "Infrastructure",
    date: "2023-05-15",
    votes: 124,
  },
  {
    id: 2,
    title: "More street lights in Central Park",
    description:
      "The park is too dark at night, making it unsafe for pedestrians.",
    location: "Central Park",
    category: "Safety",
    date: "2023-05-10",
    votes: 89,
  },
  {
    id: 3,
    title: "Community garden in East Side",
    description:
      "We need a community garden to promote sustainable living and community bonding.",
    location: "East Side Community Center",
    category: "Infrastructure",
    date: "2023-05-05",
    votes: 56,
  },
];

const Index = () => {
  const [petitionsData, setPetitionsData] = useState(initialPetitionsData);
  const { toast } = useToast();

  const handleVote = (id: number) => {
    setPetitionsData((prevData) =>
      prevData.map((petition) =>
        petition.id === id
          ? { ...petition, votes: petition.votes + 1 }
          : petition
      )
    );
    toast({
      title: "Vote recorded",
      description: "Thank you for supporting this petition!",
    });
  };

  const handleShowOnly = (category: string) => {
    // Navigate to browse page with pre-filtered category
    window.location.href = `/browse?category=${category}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-6">Make Your Voice Heard</h1>
            <p className="text-lg text-gray-300 mb-8">
              Create and sign petitions to bring positive change to your
              community
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/new">
                <Button className="bg-white text-black hover:bg-gray-100 rounded-md">
                  Start a Petition
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-700 hover:bg-gray-800"
                >
                  Browse Petitions
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-900/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold">Featured Petitions</h2>
              <Link
                to="/browse"
                className="text-sm text-gray-400 hover:text-white"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {petitionsData.map((petition) => (
                <ReportCard
                  key={petition.id}
                  {...petition}
                  onVote={handleVote}
                  onShowOnly={handleShowOnly}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-10 text-center">
              How It Works
            </h2>
            <p className="text-sm text-gray-400 text-center mb-8">
              Creating change is easy with our platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Create a Petition</h3>
                <p className="text-sm text-gray-400">
                  Sign up and create a petition about an issue you care about.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Gather Support</h3>
                <p className="text-sm text-gray-400">
                  Share your petition and gather votes from supporters.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Create Change</h3>
                <p className="text-sm text-gray-400">
                  Use your petition to advocate for meaningful change.
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-10">
              <Link to="/new">
                <Button className="bg-white text-black hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
