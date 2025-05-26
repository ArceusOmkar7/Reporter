import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAPI, ReportAPI } from "@/lib/api-service";
import { UserProfileResponse, ReportListItem } from "@/lib/api-types";
import UserDetails from "@/components/profile/UserDetails";
import UserReports from "@/components/profile/UserReports";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isCurrentUser = user?.id === Number(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userProfile = await UserAPI.getProfile(Number(userId));
        setProfile(userProfile);

        // Fetch reports created by this user
        const reportData = await ReportAPI.search();
        if (userProfile && reportData && reportData.reports) {
          const userReports = reportData.reports.filter(
            (report: ReportListItem) => report.username === userProfile.username
          );
          setReports(userReports);
        } else {
          // If reportData or reportData.reports is not as expected, set empty array
          setReports([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Redirect to login if not authenticated or trying to access another user's profile
  useEffect(() => {
    if (!user && !loading) {
      toast.error("Please sign in to view profiles");
      navigate("/signin", { replace: true });
      return;
    }

    // Only allow users to view their own profile unless they have admin role
    if (
      user &&
      Number(userId) !== user.id &&
      user.role !== "admin" &&
      !loading
    ) {
      toast.error("You can only view your own profile");
      navigate(`/profile/${user.id}`, { replace: true });
    }
  }, [user, userId, loading, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex h-[70vh] items-center justify-center dark:bg-gray-950 bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg dark:text-gray-100 text-gray-900">
            Loading profile...
          </span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 dark:bg-gray-950 bg-white min-h-screen">
          <Card className="border-red-200 dark:border-red-700 dark:bg-gray-800 bg-white">
            <CardHeader>
              <CardTitle className="text-red-500 dark:text-red-400">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dark:text-gray-300 text-gray-700">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md dark:bg-primary/80 dark:hover:bg-primary hover:bg-primary/90"
              >
                Go Back
              </button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 dark:bg-gray-950 bg-white min-h-screen">
          <Card className="dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="dark:text-gray-100 text-gray-900">
                User not found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="dark:text-gray-300 text-gray-700">
                The requested user profile could not be found.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md dark:bg-primary/80 dark:hover:bg-primary hover:bg-primary/90"
              >
                Go Back
              </button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 dark:bg-gray-950 bg-white min-h-screen dark:text-white text-gray-900">
        <h1 className="text-3xl font-bold mb-6 dark:text-gray-100 text-gray-900">
          {isCurrentUser ? "Your Profile" : `${profile.firstName}'s Profile`}
        </h1>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6 dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-200">
            <TabsTrigger
              value="details"
              className="data-[state=active]:dark:bg-gray-950 data-[state=active]:bg-white dark:text-gray-400 text-gray-500 data-[state=active]:dark:text-white data-[state=active]:text-gray-950"
            >
              Profile Details
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:dark:bg-gray-950 data-[state=active]:bg-white dark:text-gray-400 text-gray-500 data-[state=active]:dark:text-white data-[state=active]:text-gray-950"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <UserDetails
              profile={profile}
              setProfile={setProfile}
              isCurrentUser={isCurrentUser}
            />
          </TabsContent>

          <TabsContent value="reports">
            <UserReports reports={reports} isCurrentUser={isCurrentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
