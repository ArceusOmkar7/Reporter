import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";
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
    sortBy: "createdAt_desc",
    page: 1,
  });
  const [itemsPerPage] = useState(10);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: reportsData,
    isLoading: isLoadingReports,
    error: reportsError,
  } = useQuery({
    queryKey: ["reports", searchParams],
    queryFn: async () => {
      console.log("Fetching reports with params:", searchParams);
      try {
        const apiParams = {
          ...searchParams,
          category:
            searchParams.category === "all" ? "" : searchParams.category,
          limit: itemsPerPage,
        };

        const data = await ReportAPI.search(apiParams);
        console.log("Received reports data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }
    },
  });

  const reports = reportsData?.reports;
  const totalPages = reportsData?.totalPages || 1;
  const currentPage = reportsData?.currentPage || 1;

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

  const { data: userVotes = {} } = useQuery({
    queryKey: [
      "userVotes",
      user?.id,
      reports?.map((r) => r.reportID).join(","),
    ],
    queryFn: async () => {
      if (!reports || !user?.id) return {};

      console.log("Fetching user votes for reports, user ID:", user.id);
      const votes: Record<number, "upvote" | "downvote" | null> = {};

      for (const report of reports) {
        try {
          const response = await VoteAPI.getVoteCounts(
            report.reportID,
            user.id
          );
          console.log(`Vote response for report ${report.reportID}:`, response);

          if (response.userVote) {
            const voteType = response.userVote.toLowerCase();
            console.log(`Normalized vote type: ${voteType}`);

            if (voteType === "upvote") {
              votes[report.reportID] = "upvote";
            } else if (voteType === "downvote") {
              votes[report.reportID] = "downvote";
            } else {
              votes[report.reportID] = null;
            }
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

      console.log("Final collected user votes:", votes);
      return votes;
    },
    enabled: !!user?.id && !!reports,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      reportId,
      voteType,
      isRemoving = false,
    }: {
      reportId: number;
      voteType: "upvote" | "downvote";
      isRemoving?: boolean;
    }) => {
      if (isRemoving) {
        return await VoteAPI.removeVote(reportId, user?.id);
      } else {
        return await VoteAPI.vote(reportId, { voteType: voteType }, user?.id);
      }
    },
    onMutate: async ({ reportId, voteType, isRemoving }) => {
      await queryClient.cancelQueries({ queryKey: ["userVotes"] });

      const previousVotes = queryClient.getQueryData([
        "userVotes",
        user?.id,
        reports?.map((r) => r.reportID).join(","),
      ]);

      queryClient.setQueryData(
        ["userVotes", user?.id, reports?.map((r) => r.reportID).join(",")],
        (old: Record<number, string> = {}) => {
          const updated = { ...old };
          if (isRemoving) {
            updated[reportId] = null;
          } else {
            updated[reportId] = voteType;
          }
          console.log("Optimistic update:", { previous: old, updated });
          return updated;
        }
      );

      return { previousVotes };
    },
    onSuccess: (_, variables) => {
      console.log("Vote mutation succeeded:", variables);
      queryClient.invalidateQueries({ queryKey: ["userVotes"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error, variables, context) => {
      console.error("Vote mutation error:", error);
      if (context?.previousVotes) {
        queryClient.setQueryData(
          ["userVotes", user?.id, reports?.map((r) => r.reportID).join(",")],
          context.previousVotes
        );
      }
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userVotes"] });
    },
  });

  useEffect(() => {
    console.log("Component state:", {
      reportsData,
      isLoadingReports,
      reportsError,
      categories,
    });
  }, [reportsData, isLoadingReports, reportsError, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, category: value, page: 1 }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, location: e.target.value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, sortBy: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams((prev) => ({ ...prev, page: newPage }));
    }
  };

  const clearFilters = () => {
    setSearchParams({
      query: "",
      category: "",
      location: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt_desc",
      page: 1,
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

    const rawVote = userVotes?.[reportId];
    const currentVote = rawVote
      ? (rawVote.toLowerCase() as "upvote" | "downvote")
      : null;

    console.log("Current vote state before action:", {
      reportId,
      requestedVote: type,
      currentVote,
      rawVote,
    });

    try {
      if (currentVote === type) {
        console.log(`Removing ${type} vote on report ${reportId}`);

        voteMutation.mutate({
          reportId,
          voteType: type,
          isRemoving: true,
        });

        queryClient.setQueryData(
          ["userVotes", user?.id, reports?.map((r) => r.reportID).join(",")],
          (old: Record<number, string> = {}) => {
            return { ...old, [reportId]: null };
          }
        );

        toast({
          title: "Success",
          description: "Your vote has been removed",
        });
      } else {
        console.log(`Setting ${type} vote on report ${reportId}`);

        voteMutation.mutate({
          reportId,
          voteType: type,
        });

        queryClient.setQueryData(
          ["userVotes", user?.id, reports?.map((r) => r.reportID).join(",")],
          (old: Record<number, string> = {}) => {
            return { ...old, [reportId]: type };
          }
        );

        toast({
          title: "Success",
          description: `Your ${type} has been recorded`,
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

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Browse Reports</h1>
          <Link to="/new">
            <Button className="dark:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
              Start a Report
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-6 col-span-1 md:sticky md:top-24 h-fit">
            <div>
              <h3 className="text-lg font-medium mb-3">Search</h3>
              <Input
                placeholder="Search reports..."
                value={searchParams.query}
                onChange={handleSearchChange}
                className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300 focus:border-blue-500 dark:focus:border-blue-500"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Sort By</h3>
              <Select
                value={searchParams.sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300 focus:border-blue-500 dark:focus:border-blue-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 bg-white dark:border-gray-700 border-gray-300">
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                  <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                  <SelectItem value="upvotes_desc">Most Popular</SelectItem>
                  <SelectItem value="upvotes_asc">Least Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Categories</h3>
              <Select
                value={
                  searchParams.category === "" ? "all" : searchParams.category
                }
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300 focus:border-blue-500 dark:focus:border-blue-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 bg-white dark:border-gray-700 border-gray-300">
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
                        className="dark:hover:bg-gray-700 hover:bg-gray-200"
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
                className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300 focus:border-blue-500 dark:focus:border-blue-500"
              />
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full dark:bg-transparent bg-white dark:border-gray-700 border-gray-300 dark:hover:bg-gray-800 hover:bg-gray-100"
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          <div className="col-span-1 md:col-span-3">
            {isLoadingReports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <Card
                    key={i}
                    className="dark:bg-gray-800/60 bg-gray-100/80 dark:border-gray-700 border-gray-200"
                  >
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-4 dark:bg-gray-700 bg-gray-300" />
                      <Skeleton className="h-4 w-full mb-2 dark:bg-gray-700 bg-gray-300" />
                      <Skeleton className="h-4 w-full mb-2 dark:bg-gray-700 bg-gray-300" />
                      <Skeleton className="h-4 w-2/3 dark:bg-gray-700 bg-gray-300" />
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 dark:border-gray-700 border-gray-200">
                      <Skeleton className="h-8 w-20 dark:bg-gray-700 bg-gray-300" />
                      <Skeleton className="h-8 w-20 dark:bg-gray-700 bg-gray-300" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : reportsError ? (
              <div className="text-center py-12">
                <p className="dark:text-red-400 text-red-600">
                  Error loading reports. Please try again later.
                </p>
              </div>
            ) : reports?.length === 0 ? (
              <div className="text-center py-12">
                <p className="dark:text-gray-400 text-gray-500">
                  No reports found matching your criteria.
                </p>
                <Button
                  variant="link"
                  className="dark:text-blue-400 text-blue-600 mt-2"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports?.map((report: ReportListItem) => {
                  const currentVote = userVotes?.[report.reportID];
                  const hasUpvote = currentVote === "upvote";
                  const hasDownvote = currentVote === "downvote";

                  console.log(`Report ${report.reportID} vote status:`, {
                    reportID: report.reportID,
                    currentVote,
                    hasUpvote,
                    hasDownvote,
                    rawUserVotes: userVotes,
                  });

                  return (
                    <Card
                      key={report.reportID}
                      className="dark:bg-gray-800/60 bg-white dark:border-gray-700 border-gray-200 dark:hover:border-gray-600 hover:border-gray-300 transition-all h-full flex flex-col shadow-sm hover:shadow-md"
                    >
                      <Link
                        to={`/reports/${report.reportID}`}
                        className="flex-1"
                      >
                        <CardContent className="p-6 flex-1">
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2 dark:text-gray-100 text-gray-800">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {report.categoryName && (
                              <Badge
                                variant="secondary"
                                className="dark:bg-gray-700 bg-gray-200 dark:text-gray-300 text-gray-700 dark:hover:bg-gray-600 hover:bg-gray-300"
                              >
                                {report.categoryName}
                              </Badge>
                            )}
                            {report.city && report.state && (
                              <div className="flex items-center gap-1 dark:text-gray-400 text-gray-500 text-xs">
                                <MapPin size={12} />
                                <span>
                                  {report.city}, {report.state}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="dark:text-gray-300 text-gray-600 line-clamp-3 text-sm">
                            {report.description}
                          </p>
                        </CardContent>
                      </Link>
                      <CardFooter className="flex justify-between p-4 dark:border-gray-700 border-gray-200">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) =>
                              handleVote(e, report.reportID, "upvote")
                            }
                            disabled={voteMutation.isPending}
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              hasUpvote
                                ? "text-green-400"
                                : "text-gray-400 hover:text-green-400"
                            }`}
                            data-voted={hasUpvote ? "true" : "false"}
                          >
                            <ThumbsUp
                              size={16}
                              className={hasUpvote ? "fill-green-400" : ""}
                            />
                            <span>{report.upvotes || 0}</span>
                          </button>
                          <button
                            onClick={(e) =>
                              handleVote(e, report.reportID, "downvote")
                            }
                            disabled={voteMutation.isPending}
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              hasDownvote
                                ? "text-red-400"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                            data-voted={hasDownvote ? "true" : "false"}
                          >
                            <ThumbsDown
                              size={16}
                              className={hasDownvote ? "fill-red-400" : ""}
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
                  );
                })}
              </div>
            )}
            {reports && reports.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="dark:hover:bg-gray-700 hover:bg-gray-200"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="dark:hover:bg-gray-700 hover:bg-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm dark:text-gray-300 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="dark:hover:bg-gray-700 hover:bg-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="dark:hover:bg-gray-700 hover:bg-gray-200"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseReports;
