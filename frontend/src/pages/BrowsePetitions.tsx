
import { useState } from "react";
import { Header } from "@/components/Header";
import { PetitionCard } from "@/components/PetitionCard";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Initial petitions data
const initialPetitionsData = [
  {
    id: 1,
    title: "Fix the potholes on Main Street",
    description: "The potholes on Main Street have been causing damage to vehicles and are a safety hazard.",
    location: "Main Street, Downtown",
    category: "Infrastructure",
    date: "2023-05-15",
    votes: 124,
  },
  {
    id: 2,
    title: "More street lights in Central Park",
    description: "The park is too dark at night, making it unsafe for pedestrians.",
    location: "Central Park",
    category: "Safety",
    date: "2023-05-10",
    votes: 89,
  },
  {
    id: 3,
    title: "Community garden in East Side",
    description: "We need a community garden to promote sustainable living and community bonding.",
    location: "East Side Community Center",
    category: "Infrastructure",
    date: "2023-05-05",
    votes: 56,
  },
  {
    id: 4,
    title: "Improve public transportation",
    description: "We need more frequent buses and extended service hours.",
    location: "Citywide",
    category: "Infrastructure",
    date: "2023-05-01",
    votes: 218,
  },
  {
    id: 5,
    title: "Clean up River Park",
    description: "The park is littered with trash and needs a community cleanup effort.",
    location: "River Park",
    category: "Safety",
    date: "2023-04-26",
    votes: 45,
  },
  {
    id: 6,
    title: "Add bike lanes on Oak Avenue",
    description: "Oak Avenue is dangerous for cyclists. We need dedicated bike lanes.",
    location: "Oak Avenue",
    category: "Infrastructure",
    date: "2023-04-25",
    votes: 87,
  },
];

const BrowsePetitions = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Newest");
  const [petitionsData, setPetitionsData] = useState(initialPetitionsData);
  const { toast } = useToast();

  // Handle voting on petitions
  const handleVote = (id: number) => {
    setPetitionsData(prevData => 
      prevData.map(petition => 
        petition.id === id ? { ...petition, votes: petition.votes + 1 } : petition
      )
    );
    toast({
      title: "Vote recorded",
      description: "Thank you for supporting this petition!",
    });
  };

  // Handle "Show Only" button click to filter by category
  const handleShowOnly = (selectedCategory: string) => {
    setCategory(selectedCategory);
    toast({
      title: "Category filter applied",
      description: `Showing only ${selectedCategory} petitions`,
    });
  };

  // Filter and sort petitions based on user selections
  const filteredPetitions = petitionsData.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(search.toLowerCase()) || 
                         petition.description.toLowerCase().includes(search.toLowerCase()) ||
                         petition.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === "All Categories" || petition.category === category;
    
    return matchesSearch && matchesCategory;
  });

  // Sort the filtered petitions
  const sortedPetitions = [...filteredPetitions].sort((a, b) => {
    if (sortBy === "Newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "Oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "Most Votes") {
      return b.votes - a.votes;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-10">Browse Petitions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr] gap-4 mb-8">
          <Input 
            type="text" 
            placeholder="Search petitions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900/50 border-gray-700"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="Environment">Environment</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
              <SelectValue placeholder="Newest" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="Newest">Newest</SelectItem>
              <SelectItem value="Most Votes">Most Votes</SelectItem>
              <SelectItem value="Oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPetitions.map((petition) => (
            <PetitionCard 
              key={petition.id} 
              {...petition} 
              onVote={handleVote}
              onShowOnly={handleShowOnly}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrowsePetitions;
