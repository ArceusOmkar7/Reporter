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
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
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
        const response = await ReportAPI.search(); // Changed variable name to response
        // Get random subset of reports (up to 3)
        // Access the .reports property from the response
        const fetchedReports = response.reports
          .sort(() => 0.5 - Math.random())
          .slice(0, 3); // Renamed to fetchedReports
        setReports(fetchedReports); // Use fetchedReports

        // Fetch user votes for these reports
        if (user?.id) {
          const votes: Record<number, "upvote" | "downvote" | null> = {};
          for (const report of fetchedReports) {
            // Use fetchedReports
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
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 via-blue-200 to-indigo-300 dark:from-slate-900 dark:to-sky-950 text-gray-900 dark:text-white">
      <Header /> {/* Floating Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="p-2 dark:bg-gray-800/80 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border dark:border-gray-700 border-gray-200 transition-all hover:scale-110 hover:shadow-xl animate-pulse-slow">
          <ThemeToggle variant="ghost" size="icon" />
          <span className="sr-only">Toggle theme</span>
        </div>
      </div>
      <main className="flex-1">
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 text-center md:text-left z-10">
                <h1 className="text-5xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Reportr
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 my-7">
                  Make your voice heard. Report issues, track progress, and
                  build a better community together.
                </p>
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                  <Link to="/new">
                    <Button className="dark:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md px-6 py-2">
                      Start a Report
                    </Button>
                  </Link>
                  <Link to="/browse">
                    <Button
                      variant="outline"
                      className="dark:bg-transparent bg-white dark:border-blue-700 border-blue-600 dark:text-blue-400 text-blue-600 dark:hover:bg-blue-950/50 hover:bg-blue-50 px-6 py-2"
                    >
                      Browse Reports
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="p-2 dark:bg-gradient-to-br dark:from-blue-500 dark:to-purple-600 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl shadow-xl">
                  <div className="w-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-1">
                    <img
                      src="/hero.jpg"
                      alt="Community"
                      className="w-full h-auto max-h-80 object-cover mx-auto"
                    />
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 dark:bg-blue-500/20 bg-blue-300/20 rounded-full filter blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 dark:bg-purple-500/20 bg-purple-300/20 rounded-full filter blur-3xl"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] dark:bg-blue-900/20 bg-blue-100/50 rounded-full filter blur-3xl -z-10"></div>
        </section>{" "}
        <section className="py-16 dark:bg-gray-900/30 bg-gray-50 relative">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold">Featured Reports</h2>
              <Link
                to="/browse"
                className="text-sm dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 transition-colors"
              >
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="dark:bg-gray-800/50 bg-gray-200/80 animate-pulse rounded-md h-80"
                  ></div>
                ))}
              </div>
            ) : reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reports.map((report) => (
                  <Link
                    key={report.reportID}
                    to={`/reports/${report.reportID}`}
                    className="block hover:scale-[1.02] transition-transform"
                  >
                    <ReportCard
                      {...formatReportForCard(report)}
                      onVote={handleReportCardVote}
                      onShowOnly={handleShowOnly}
                      userVote={userVotes[report.reportID]}
                      isHomePage={true}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center dark:text-gray-400 text-gray-500 py-12">
                <p>No reports found. Be the first to create a report!</p>
                <Link to="/new" className="mt-4 inline-block">
                  <Button className="dark:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600 mt-4">
                    Create Report
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Footer */}{" "}
      <footer>
        <div className="container mx-auto px-4 md:px-6 py-8 text-center">
          <div className="mb-4">
            {/* Social media icons can be added here */}
          </div>
          <p>© {new Date().getFullYear()} Reportr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
