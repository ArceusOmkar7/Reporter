/**
 * Admin Dashboard
 *
 * Main admin dashboard page that provides access to all administrative functions:
 * - Overview of system statistics
 * - User management
 * - Report management and moderation
 * - Category management
 * - Analytics and visualizations
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserAPI, ReportAPI } from "@/lib/api-service";
import { toast } from "sonner";
import { UserManagement } from "../../components/admin/UserManagement";
import { ReportManagement } from "../../components/admin/ReportManagement";
import { CategoryManagement } from "../../components/admin/CategoryManagement";
import { AnalyticsDashboard } from "../../components/admin/analytics/AnalyticsDashboard";
import AdminQueryPage from "@/components/admin/AdminQuery";
import { Loader2 } from "lucide-react";
import { ReportListItem } from "@/lib/api-types";

// Extended report item with status field
interface ExtendedReportItem extends ReportListItem {
  status?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
  });

  // Check if user is authenticated and has admin role
  useEffect(() => {
    const checkAdminAccess = async () => {
      setLoading(true);

      // If no user or not admin, redirect to login
      if (!user) {
        toast.error("Please sign in to access the admin dashboard");
        navigate("/signin", { replace: true });
        return;
      }

      // Check for Administrator role (matching database enum)
      if (user.role !== "Administrator") {
        toast.error("You don't have permission to access the admin dashboard");
        navigate("/", { replace: true });
        return;
      }

      try {
        // Fetch basic stats for dashboard
        const users = await UserAPI.getAllUsers();
        const reportsData = await ReportAPI.search(); // Renamed to reportsData

        setStats({
          totalUsers: users.length,
          totalReports: reportsData.totalReports, // Use totalReports from the API response
        });
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        toast.error("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading admin dashboard...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Site
          </Button>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReports}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Report Management</TabsTrigger>
            <TabsTrigger value="categories">Category Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sql-query">SQL Query Executor</TabsTrigger>{" "}
            {/* Add new tab trigger */}
          </TabsList>

          <TabsContent value="users" className="p-4 border rounded-md">
            <UserManagement />
          </TabsContent>

          <TabsContent value="reports" className="p-4 border rounded-md">
            <ReportManagement />
          </TabsContent>

          <TabsContent value="categories" className="p-4 border rounded-md">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="analytics" className="p-4 border rounded-md">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Add new tab content for SQL Query Executor */}
          <TabsContent value="sql-query" className="p-4 border rounded-md">
            <AdminQueryPage />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
