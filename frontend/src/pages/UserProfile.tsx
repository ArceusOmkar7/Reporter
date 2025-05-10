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
        const userReports = reportData.filter(
          (report) => report.username === userProfile.username
        );
        setReports(userReports);

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

  // Redirect to login if trying to access profile when not logged in
  useEffect(() => {
    if (!user && !loading) {
      navigate("/signin", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>User not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested user profile could not be found.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isCurrentUser ? "Your Profile" : `${profile.firstName}'s Profile`}
      </h1>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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
  );
}
