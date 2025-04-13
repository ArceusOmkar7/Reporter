
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ArrowLeft, Share2, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample petition data
const petitionsData = [
  {
    id: "1",
    title: "Fix the potholes on Main Street",
    description: `The potholes on Main Street have been causing damage to vehicles and are a safety hazard. They have been present for over 5 months and are getting worse with each rainfall. Multiple accidents have occurred due to drivers swerving to avoid them.

We request the city to repair these potholes as soon as possible to prevent further damage and potential injuries. The affected area spans approximately 2 blocks from Oak Avenue to Pine Street.`,
    location: "Main Street, Downtown",
    category: "Infrastructure",
    date: "2023-05-15",
    votes: 124,
    createdBy: "John Doe"
  },
];

const PetitionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [petition, setPetition] = useState(petitionsData.find(p => p.id === id));
  const { toast } = useToast();
  
  useEffect(() => {
    // This would normally fetch data from an API
    setPetition(petitionsData.find(p => p.id === id));
  }, [id]);

  if (!petition) {
    return <div>Petition not found</div>;
  }

  const handleVote = () => {
    setPetition(prev => {
      if (!prev) return prev;
      return { ...prev, votes: prev.votes + 1 };
    });
    
    toast({
      title: "Thank you!",
      description: "Your signature has been added to this petition.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Petition link copied to clipboard. Share it with others!",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link to="/browse" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
            <ArrowLeft size={16} className="mr-1" />
            Back to Petitions
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{petition.title}</h1>
        
        <div className="flex text-sm text-gray-400 mb-8">
          <span className="mr-4 inline-flex items-center">
            <span className="bg-gray-800 px-2 py-0.5 rounded mr-2">{petition.category}</span> 
            {petition.location}
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          <div>
            <div className="image-placeholder h-72 w-full mb-8 rounded-md bg-gray-800/50 flex items-center justify-center">
              <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            
            <div className="mb-8">
              <h2 className="font-semibold mb-2">Description</h2>
              <div className="text-gray-300 whitespace-pre-line">
                {petition.description}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-900/30 p-6 rounded-md border border-gray-800">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">{petition.votes}</div>
                <div className="text-sm text-gray-400">People have signed</div>
              </div>
              
              <div className="mb-4">
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-200 mb-3"
                  onClick={handleVote}
                >
                  <ThumbsUp size={16} className="mr-2" /> Sign this petition
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
                  onClick={handleShare}
                >
                  <Share2 size={16} className="mr-2" /> Share
                </Button>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                Created by {petition.createdBy}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetitionDetails;
