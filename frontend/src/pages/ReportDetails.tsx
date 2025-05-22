import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ReportAPI, VoteAPI, UserAPI } from "@/lib/api-service";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { UserAvatar } from "@/components/UserAvatar";
import {
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MapPin,
  User,
  Image,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";

const ReportDetails = () => {
  const { id } = useParams<{ id: string }>();
  const reportId = parseInt(id || "0");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [userVote, setUserVote] = useState<string | null>(null);
  const [reportAuthor, setReportAuthor] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  // Fetch report details
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => ReportAPI.getDetails(reportId),
    enabled: !!reportId,
  });

  // Fetch user's vote when report loads
  useEffect(() => {
    if (report && user?.id) {
      // Check if user has already voted
      const checkUserVote = async () => {
        try {
          const response = await VoteAPI.getVoteCounts(reportId, user?.id);
          console.log(`Vote response for report ${reportId}:`, response);

          // Normalize vote type to lowercase
          if (response.userVote) {
            const normalizedVote = response.userVote.toLowerCase();
            console.log(`Normalized vote for report: ${normalizedVote}`);
            setUserVote(normalizedVote);
          } else {
            setUserVote(null);
          }
        } catch (error) {
          console.error("Error checking user vote:", error);
          setUserVote(null);
        }
      };
      checkUserVote();
    }
  }, [report, user?.id, reportId]);

  // Fetch report author details
  useEffect(() => {
    if (report && report.userID) {
      const fetchAuthor = async () => {
        try {
          const authorData = await UserAPI.getProfile(report.userID);
          setReportAuthor(authorData);
        } catch (error) {
          console.error("Error fetching author details:", error);
        }
      };
      fetchAuthor();
    }
  }, [report]);

  // Mutation for voting
  const voteMutation = useMutation({
    mutationFn: ({
      type,
      userId,
    }: {
      type: "upvote" | "downvote";
      userId?: number;
    }) => {
      return VoteAPI.vote(reportId, { voteType: type }, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
    },
  });

  // Mutation for deleting a report
  const deleteMutation = useMutation({
    mutationFn: (userId?: number) => {
      return ReportAPI.delete(reportId, userId);
    },
    onSuccess: () => {
      toast.success("Report deleted successfully");
      navigate("/browse");
    },
    onError: (error) => {
      toast.error("Failed to delete report");
      console.error("Delete error:", error);
    },
  });

  const handleVote = (type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      toast("Please sign in to vote", {
        action: {
          label: "Sign in",
          onClick: () => navigate("/signin"),
        },
      });
      return;
    }

    // Get current vote state - normalize if needed
    const currentVote = userVote ? userVote.toLowerCase() : null;
    console.log("Current vote state before action:", {
      reportId,
      requestedVote: type,
      currentVote,
    });

    // Optimistically update the UI
    const previousVote = currentVote;
    setUserVote(type);

    // Update vote counts immediately
    if (report) {
      const updatedReport = { ...report };
      if (previousVote === "upvote") {
        updatedReport.upvotes = (updatedReport.upvotes || 0) - 1;
      } else if (previousVote === "downvote") {
        updatedReport.downvotes = (updatedReport.downvotes || 0) - 1;
      }

      if (type === "upvote") {
        updatedReport.upvotes = (updatedReport.upvotes || 0) + 1;
      } else {
        updatedReport.downvotes = (updatedReport.downvotes || 0) + 1;
      }

      // Update the report in the cache
      queryClient.setQueryData(["report", reportId], updatedReport);
    }

    // If user has already voted with the same type, remove the vote
    if (previousVote === type) {
      voteMutation.mutate(
        { type, userId: user?.id },
        {
          onError: () => {
            // Revert on error
            setUserVote(previousVote);
            queryClient.invalidateQueries({ queryKey: ["report", reportId] });
            toast.error("Failed to remove your vote");
          },
          onSuccess: () => {
            setUserVote(null);
            toast.success("Your vote has been removed");

            // Update the report in cache after successful removal
            if (report) {
              const updatedReport = { ...report };
              if (type === "upvote") {
                updatedReport.upvotes = Math.max(
                  0,
                  (updatedReport.upvotes || 0) - 1
                );
              } else {
                updatedReport.downvotes = Math.max(
                  0,
                  (updatedReport.downvotes || 0) - 1
                );
              }
              queryClient.setQueryData(["report", reportId], updatedReport);
            }
          },
        }
      );
      return;
    }

    // If user has voted differently, update the vote
    voteMutation.mutate(
      { type, userId: user?.id },
      {
        onError: () => {
          // Revert on error
          setUserVote(previousVote);
          queryClient.invalidateQueries({ queryKey: ["report", reportId] });
          toast.error("Failed to record your vote");
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteMutation.mutate(user?.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <Skeleton className="h-10 w-3/4 mb-6 dark:bg-gray-800 bg-gray-300" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <Card className="dark:bg-gray-800/60 bg-gray-100/80 dark:border-gray-700 border-gray-200 p-6 mb-8">
                <Skeleton className="h-6 w-1/2 mb-4 dark:bg-gray-700 bg-gray-300" />
                <Skeleton className="h-4 w-full mb-3 dark:bg-gray-700 bg-gray-300" />
                <Skeleton className="h-4 w-full mb-3 dark:bg-gray-700 bg-gray-300" />
                <Skeleton className="h-4 w-full mb-3 dark:bg-gray-700 bg-gray-300" />
                <Skeleton className="h-4 w-3/4 dark:bg-gray-700 bg-gray-300" />
              </Card>
            </div>
            <div className="col-span-1">
              <Card className="dark:bg-gray-800/60 bg-gray-100/80 dark:border-gray-700 border-gray-200 p-6 mb-6">
                <Skeleton className="h-6 w-3/4 mb-4 dark:bg-gray-700 bg-gray-300" />
                <Skeleton className="h-4 w-full mb-3 dark:bg-gray-700 bg-gray-300" />
                <Skeleton className="h-10 w-full mt-4 dark:bg-gray-700 bg-gray-300" />
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle
              size={64}
              className="mx-auto dark:text-red-500 text-red-600 mb-4"
            />
            <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
            <p className="dark:text-gray-400 text-gray-500 mb-6">
              The report you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate("/browse")}
              className="dark:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Browse Reports
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = format(new Date(report.createdAt), "MMMM d, yyyy");
  const isOwner = user?.id === report.userID;

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{report.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 dark:bg-transparent bg-white dark:border-gray-600 border-gray-300 dark:hover:bg-gray-800 hover:bg-gray-100"
                onClick={() => navigate(`/edit/${report.reportID}`)}
              >
                <Edit size={16} />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 dark:bg-transparent bg-white dark:border-gray-600 border-gray-300 dark:text-red-400 text-red-500 dark:hover:bg-red-900/20 hover:bg-red-500/10 hover:border-red-500/50 dark:hover:border-red-700"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <Card className="dark:bg-gray-800/60 bg-gray-50 dark:border-gray-700 border-gray-200 p-6 mb-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                {report.categoryName && (
                  <Badge
                    variant="secondary"
                    className="dark:bg-gray-700 bg-gray-200 dark:text-gray-300 text-gray-700 dark:hover:bg-gray-600 hover:bg-gray-300"
                  >
                    {report.categoryName}
                  </Badge>
                )}
                <div className="flex items-center gap-1 dark:text-gray-400 text-gray-500 text-sm">
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </div>
                {report.username && (
                  <div className="flex items-center gap-2 dark:text-gray-400 text-gray-500 text-sm">
                    {reportAuthor ? (
                      <UserAvatar
                        firstName={reportAuthor.firstName}
                        lastName={reportAuthor.lastName}
                        size="sm"
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <span>Posted by {report.username}</span>
                  </div>
                )}
                {report.city && report.state && (
                  <div className="flex items-center gap-1 dark:text-gray-400 text-gray-500 text-sm">
                    <MapPin size={16} />
                    <span>
                      {report.street}, {report.city}, {report.state}
                    </span>
                  </div>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="dark:text-gray-200 text-gray-700 whitespace-pre-line">
                  {report.description}
                </p>
              </div>

              {report.images && report.images.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                    <Image size={20} />
                    Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {report.images.map((image) => (
                      <div
                        key={image.imageID}
                        className="rounded-md overflow-hidden border dark:border-gray-700 border-gray-200"
                      >
                        <ImageWithFallback
                          src={image.imageURL}
                          alt={`Image for ${report.title}`}
                          className="w-full h-auto max-h-64 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="dark:bg-gray-800/60 bg-gray-50 dark:border-gray-700 border-gray-200 p-6 mb-6 sticky top-24 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Support this report</h3>
              <p className="dark:text-gray-300 text-gray-600 mb-6">
                Show your support by upvoting this report. Your vote matters!
              </p>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className={`flex-1 flex items-center justify-center gap-2 dark:border-gray-600 border-gray-300 dark:hover:bg-gray-700/70 hover:bg-gray-100 ${
                    userVote === "upvote"
                      ? "dark:text-green-400 text-green-600 dark:border-green-500 border-green-500 dark:bg-green-900/20 bg-green-500/10"
                      : "dark:text-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleVote("upvote")}
                  disabled={voteMutation.isPending}
                >
                  <ThumbsUp
                    size={18}
                    className={userVote === "upvote" ? "fill-green-400" : ""}
                  />
                  <span>{report.upvotes || 0}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className={`flex-1 flex items-center justify-center gap-2 dark:border-gray-600 border-gray-300 dark:hover:bg-gray-700/70 hover:bg-gray-100 ${
                    userVote === "downvote"
                      ? "dark:text-red-400 text-red-600 dark:border-red-500 border-red-500 dark:bg-red-900/20 bg-red-500/10"
                      : "dark:text-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleVote("downvote")}
                  disabled={voteMutation.isPending}
                >
                  <ThumbsDown
                    size={18}
                    className={userVote === "downvote" ? "fill-red-400" : ""}
                  />
                  <span>{report.downvotes || 0}</span>
                </Button>
              </div>
            </Card>

            <Card className="dark:bg-gray-800/60 bg-gray-50 dark:border-gray-700 border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Location</h3>
              {report.latitude && report.longitude ? (
                <div className="rounded-md overflow-hidden h-64 dark:bg-gray-700 bg-gray-200">
                  <iframe
                    title="Report location"
                    width="100%"
                    height="100%"
                    src={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p className="dark:text-gray-400 text-gray-500">
                  No location coordinates available
                </p>
              )}

              {report.street && (
                <address className="dark:text-gray-300 text-gray-600 mt-4 not-italic">
                  {report.street}
                  <br />
                  {report.city}, {report.state}
                  <br />
                  {report.country}
                </address>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportDetails;
