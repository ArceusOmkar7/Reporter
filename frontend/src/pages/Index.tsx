import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ReportCard } from "@/components/ReportCard";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { ReportAPI } from "@/lib/api-service";
import { API_BASE_URL } from "@/lib/api-config";
import type { ReportListItem } from "@/lib/api-types";

const Index = () => {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch random reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await ReportAPI.search();
        // Get random subset of reports (up to 3)
        const randomReports = data.sort(() => 0.5 - Math.random()).slice(0, 3);
        setReports(randomReports);
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
  }, [toast]);

  const handleVote = (id: number) => {
    setReports((prevData) =>
      prevData.map((report) =>
        report.reportID === id
          ? { ...report, upvotes: (report.upvotes || 0) + 1 }
          : report
      )
    );
    toast({
      title: "Vote recorded",
      description: "Thank you for supporting this report!",
    });
  };

  const handleShowOnly = (category: string) => {
    // Navigate to browse page with pre-filtered category
    window.location.href = `/browse?category=${category}`;
  };

  // Helper function to format report data for ReportCard
  const formatReportForCard = (report: ReportListItem) => ({
    id: report.reportID,
    title: report.title,
    description: report.description,
    location: `${report.street || ""}, ${report.city || ""}`,
    category: report.categoryName || "Uncategorized",
    date: new Date(report.createdAt).toLocaleDateString(),
    votes: report.upvotes || 0,
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
                      onVote={handleVote}
                      onShowOnly={handleShowOnly}
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
