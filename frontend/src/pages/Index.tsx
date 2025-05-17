import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ReportCard } from "@/components/ReportCard";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { ReportAPI, VoteAPI } from "@/lib/api-service";
import { API_BASE_URL } from "@/lib/api-config";
import type { ReportListItem } from "@/lib/api-types";
import { useAuth } from "@/contexts/AuthContext";
import { ToastAction } from "@/components/ui/toast";

const Index = () => {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<
    Record<number, "upvote" | "downvote" | null>
  >({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fetch random reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await ReportAPI.search();
        // Get random subset of reports (up to 3)
        const randomReports = data.sort(() => 0.5 - Math.random()).slice(0, 3);
        setReports(randomReports);

        // Fetch user votes for these reports
        if (user?.id) {
          const votes: Record<number, "upvote" | "downvote" | null> = {};
          for (const report of randomReports) {
            try {
              const response = await VoteAPI.getVoteCounts(
                report.reportID,
                user?.id
              );
              console.log(
                `Vote response for home report ${report.reportID}:`,
                response
              );

              // Normalize vote type to lowercase
              if (response.userVote) {
                const normalizedVote = response.userVote.toLowerCase();
                console.log(`Normalized vote: ${normalizedVote}`);
                votes[report.reportID] = normalizedVote as
                  | "upvote"
                  | "downvote";
              } else {
                votes[report.reportID] = null;
              }
            } catch (error) {
              console.error(
                `Error fetching vote for report ${report.reportID}:`,
                error
              );
              votes[report.reportID] = null;
            }
          }
          console.log("All collected votes:", votes);
          setUserVotes(votes);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast({
          title: "Error",
          description: "Failed to load reports. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast, user?.id]);

  const handleVote = async (id: number, type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote",
        action: (
          <ToastAction altText="Sign In" onClick={() => navigate("/signin")}>
            Sign In
          </ToastAction>
        ),
      });
      return;
    }

    // Get current vote state - normalize to lowercase if needed
    const currentVoteRaw = userVotes[id];
    const currentVote = currentVoteRaw
      ? (currentVoteRaw.toLowerCase() as "upvote" | "downvote")
      : null;

    console.log("Current vote state before action:", {
      reportId: id,
      requestedVote: type,
      currentVote,
      rawCurrentVote: currentVoteRaw,
    });

    try {
      // If user has already voted with the same type, remove the vote
      if (currentVote === type) {
        const response = await VoteAPI.removeVote(id, user?.id);
        if (response) {
          setUserVotes((prev) => ({ ...prev, [id]: null }));
          setReports((prev) =>
            prev.map((report) =>
              report.reportID === id
                ? {
                    ...report,
                    upvotes:
                      type === "upvote"
                        ? (report.upvotes || 0) - 1
                        : report.upvotes,
                    downvotes:
                      type === "downvote"
                        ? (report.downvotes || 0) - 1
                        : report.downvotes,
                  }
                : report
            )
          );
          toast({
            title: "Success",
            description: "Your vote has been removed",
            variant: "default",
          });
        }
        return;
      }

      // If user has voted differently, update the vote
      const response = await VoteAPI.vote(id, { voteType: type }, user?.id);
      if (response) {
        setUserVotes((prev) => ({ ...prev, [id]: type }));

        // Update the report's vote counts
        setReports((prev) =>
          prev.map((report) => {
            if (report.reportID === id) {
              // Check if user had previously voted the opposite way
              const hadOppositeVote =
                (userVotes[id] === "upvote" && type === "downvote") ||
                (userVotes[id] === "downvote" && type === "upvote");

              const newUpvotes =
                type === "upvote"
                  ? (report.upvotes || 0) + 1
                  : hadOppositeVote && type === "downvote"
                  ? (report.upvotes || 0) - 1
                  : report.upvotes || 0;

              const newDownvotes =
                type === "downvote"
                  ? (report.downvotes || 0) + 1
                  : hadOppositeVote && type === "upvote"
                  ? (report.downvotes || 0) - 1
                  : report.downvotes || 0;

              return {
                ...report,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
              };
            }
            return report;
          })
        );

        toast({
          title: "Success",
          description: `Your ${type} has been recorded`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to record vote:", error);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    }
  };

  // Wrapper function for ReportCard
  const handleReportCardVote = (id: number, type: "upvote" | "downvote") => {
    handleVote(id, type);
  };

  const handleShowOnly = (category: string) => {
    navigate(`/browse?category=${category}`);
  };

  // Helper function to format report data for ReportCard
  const formatReportForCard = (report: ReportListItem) => ({
    id: report.reportID,
    title: report.title,
    description: report.description,
    location: `${report.street || ""}, ${report.city || ""}`,
    category: report.categoryName || "Uncategorized",
    date: new Date(report.createdAt).toLocaleDateString(),
    upvotes: report.upvotes || 0,
    downvotes: report.downvotes || 0,
    image:
      report.imageCount && report.imageCount > 0
        ? `${API_BASE_URL}/api/image/${report.reportID}`
        : "/placeholder-report.svg",
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-6">Make Your Voice Heard</h1>
            <p className="text-lg text-gray-300 mb-8">
              Create and sign reports to bring positive change to your community
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/new">
                <Button className="bg-white text-black hover:bg-gray-100 rounded-md">
                  Start a Report
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-700 hover:bg-gray-800"
                >
                  Browse Reports
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-900/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold">Featured Reports</h2>
              <Link
                to="/browse"
                className="text-sm text-gray-400 hover:text-white"
              >
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 animate-pulse rounded-md h-80"
                  ></div>
                ))}
              </div>
            ) : reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reports.map((report) => (
                  <Link
                    key={report.reportID}
                    to={`/reports/${report.reportID}`}
                    className="block"
                  >
                    <ReportCard
                      {...formatReportForCard(report)}
                      onVote={handleReportCardVote}
                      onShowOnly={handleShowOnly}
                      userVote={userVotes[report.reportID]}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>No reports found. Be the first to create a report!</p>
                <Link to="/new" className="mt-4 inline-block">
                  <Button className="bg-white text-black hover:bg-gray-100 mt-4">
                    Create Report
                  </Button>
                </Link>
              </div>
            )}
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
                <h3 className="text-xl font-bold mb-2">Create a Report</h3>
                <p className="text-sm text-gray-400">
                  Sign up and create a report about an issue you care about.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Gather Support</h3>
                <p className="text-sm text-gray-400">
                  Share your report and gather votes from supporters.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Create Change</h3>
                <p className="text-sm text-gray-400">
                  Use your report to advocate for meaningful change.
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
