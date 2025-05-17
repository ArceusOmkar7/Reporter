import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ReportAPI, CategoryAPI, VoteAPI } from "@/lib/api-service";
import { ReportListItem, CategoryBase } from "@/lib/api-types";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, ThumbsDown, Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BrowseReports = () => {
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: "",
    location: "",
    dateFrom: "",
    dateTo: "",
  });
  const [userVotes, setUserVotes] = useState<
    Record<number, "upvote" | "downvote" | null>
  >({});
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch reports based on search parameters
  const {
    data: reports,
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["reports", searchParams],
    queryFn: async () => {
      console.log("Fetching reports with params:", searchParams);
      try {
        // Don't send "all" as a category to the API, leave it as empty string
        const apiParams = {
          ...searchParams,
          category:
            searchParams.category === "all" ? "" : searchParams.category,
        };

        const data = await ReportAPI.search(apiParams);
        console.log("Received reports:", data);
        return data;
      } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }
    },
  });

  // Fetch categories for the filter dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories");
      try {
        const data = await CategoryAPI.getAll();
        console.log("Received categories:", data);
        return data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
  });

  // Fetch user votes - memoized to be called when needed
  const fetchUserVotes = useCallback(async () => {
    if (!reports || !user?.id) return;

    console.log("Fetching user votes for reports");
    const votes: Record<number, "upvote" | "downvote" | null> = {};

    for (const report of reports) {
      try {
        const response = await VoteAPI.getVoteCounts(report.reportID, user?.id);
        console.log(`Vote for report ${report.reportID}:`, response);
        votes[report.reportID] = response.userVote || null;
      } catch (error) {
        console.error(
          `Error fetching vote for report ${report.reportID}:`,
          error
        );
        votes[report.reportID] = null;
      }
    }

    console.log("Final collected user votes:", votes);
    setUserVotes(votes);
  }, [reports, user?.id]);

  // Initial fetch of user votes
  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  useEffect(() => {
    console.log("Component state:", {
      reports,
      isLoadingReports,
      reportsError,
      categories,
    });
  }, [reports, isLoadingReports, reportsError, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, query: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, category: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, location: e.target.value }));
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchParams({
      query: "",
      category: "",
      location: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleVote = async (
    e: React.MouseEvent,
    reportId: number,
    type: "upvote" | "downvote"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote",
        action: (
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
        ),
      });
      return;
    }

    try {
      // Save previous vote state
      const previousVote = userVotes[reportId];

      // If user has already voted with the same type, they're toggling it off
      if (userVotes[reportId] === type) {
        // Optimistically update UI
        setUserVotes((prev) => ({ ...prev, [reportId]: null }));

        // Update report counts locally
        const reportToUpdate = reports?.find((r) => r.reportID === reportId);
        if (reportToUpdate) {
          if (type === "upvote") {
            reportToUpdate.upvotes = Math.max(
              0,
              (reportToUpdate.upvotes || 0) - 1
            );
          } else {
            reportToUpdate.downvotes = Math.max(
              0,
              (reportToUpdate.downvotes || 0) - 1
            );
          }
        }

        // Then call API
        await VoteAPI.removeVote(reportId, user?.id);
        toast({
          title: "Success",
          description: "Your vote has been removed",
        });

        // Fetch the latest votes after removing
        await fetchUserVotes();
        return;
      }

      // If user is changing vote type (upvote to downvote or vice versa)
      // Optimistically update UI
      setUserVotes((prev) => ({ ...prev, [reportId]: type }));

      // Update report counts locally
      const reportToUpdate = reports?.find((r) => r.reportID === reportId);
      if (reportToUpdate) {
        // If changing vote type, decrement previous vote type and increment new one
        if (previousVote === "upvote" && type === "downvote") {
          reportToUpdate.upvotes = Math.max(
            0,
            (reportToUpdate.upvotes || 0) - 1
          );
          reportToUpdate.downvotes = (reportToUpdate.downvotes || 0) + 1;
        } else if (previousVote === "downvote" && type === "upvote") {
          reportToUpdate.downvotes = Math.max(
            0,
            (reportToUpdate.downvotes || 0) - 1
          );
          reportToUpdate.upvotes = (reportToUpdate.upvotes || 0) + 1;
        } else {
          // New vote
          if (type === "upvote") {
            reportToUpdate.upvotes = (reportToUpdate.upvotes || 0) + 1;
          } else {
            reportToUpdate.downvotes = (reportToUpdate.downvotes || 0) + 1;
          }
        }
      }

      // Then call API
      await VoteAPI.vote(reportId, { voteType: type }, user?.id);
      toast({
        title: "Success",
        description: `Your ${type} has been recorded`,
      });

      // Fetch the latest votes after voting
      await fetchUserVotes();
    } catch (error) {
      console.error("Failed to record vote:", error);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });

      // Refresh the votes even on error to ensure UI is consistent
      await fetchUserVotes();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Browse Reports</h1>
          <Link to="/new">
            <Button className="bg-white text-black hover:bg-gray-200">
              Start a Report
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="space-y-6 col-span-1">
            <div>
              <h3 className="text-lg font-medium mb-3">Search</h3>
              <Input
                placeholder="Search reports..."
                value={searchParams.query}
                onChange={handleSearchChange}
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Categories</h3>
              <Select
                value={
                  searchParams.category === "" ? "all" : searchParams.category
                }
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : (
                    categories?.map((category: CategoryBase) => (
                      <SelectItem
                        key={category.categoryID}
                        value={category.categoryName}
                      >
                        {category.categoryName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Location</h3>
              <Input
                placeholder="City, State, or Country"
                value={searchParams.location}
                onChange={handleLocationChange}
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Reports grid */}
          <div className="col-span-1 md:col-span-3">
            {isLoadingReports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-gray-900/30 border-gray-800">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-4 bg-gray-800" />
                      <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                      <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                      <Skeleton className="h-4 w-2/3 bg-gray-800" />
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 border-t border-gray-800">
                      <Skeleton className="h-8 w-20 bg-gray-800" />
                      <Skeleton className="h-8 w-20 bg-gray-800" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : reportsError ? (
              <div className="text-center py-12">
                <p className="text-red-400">
                  Error loading reports. Please try again later.
                </p>
              </div>
            ) : reports?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No reports found matching your criteria.
                </p>
                <Button
                  variant="link"
                  className="text-white mt-2"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports?.map((report: ReportListItem) => (
                  <Card
                    key={report.reportID}
                    className="bg-gray-900/30 border-gray-800 hover:border-gray-700 transition-all h-full flex flex-col"
                  >
                    <Link to={`/reports/${report.reportID}`} className="flex-1">
                      <CardContent className="p-6 flex-1">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                          {report.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {report.categoryName && (
                            <Badge className="bg-gray-800 hover:bg-gray-800 text-white">
                              {report.categoryName}
                            </Badge>
                          )}
                          {report.city && report.state && (
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <MapPin size={12} />
                              <span>
                                {report.city}, {report.state}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 line-clamp-3 text-sm">
                          {report.description}
                        </p>
                      </CardContent>
                    </Link>
                    <CardFooter className="flex justify-between p-4 border-t border-gray-800">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) =>
                            handleVote(e, report.reportID, "upvote")
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded ${
                            userVotes[report.reportID] === "upvote"
                              ? "text-green-400 bg-green-900/40 border border-green-600"
                              : "text-gray-400 hover:text-green-400 hover:bg-green-900/20"
                          }`}
                        >
                          <ThumbsUp
                            size={16}
                            className={
                              userVotes[report.reportID] === "upvote"
                                ? "fill-green-400"
                                : ""
                            }
                          />
                          <span>{report.upvotes || 0}</span>
                        </button>
                        <button
                          onClick={(e) =>
                            handleVote(e, report.reportID, "downvote")
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded ${
                            userVotes[report.reportID] === "downvote"
                              ? "text-red-400 bg-red-900/40 border border-red-600"
                              : "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                          }`}
                        >
                          <ThumbsDown
                            size={16}
                            className={
                              userVotes[report.reportID] === "downvote"
                                ? "fill-red-400"
                                : ""
                            }
                          />
                          <span>{report.downvotes || 0}</span>
                        </button>
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <Calendar size={12} className="mr-1" />
                        {formatDistanceToNow(new Date(report.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseReports;
