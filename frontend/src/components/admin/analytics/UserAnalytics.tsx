/**
 * User Analytics Component
 *
 * Displays analytics about users:
 * - Most active users
 * - User distribution by location (India-specific)
 * - User role distribution
 */
import { useState, useEffect } from "react";
import { AnalyticsAPI } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function UserAnalytics() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Using default period "monthly" as a reasonable timeframe for analytics
      const data = await AnalyticsAPI.getUserAnalytics("monthly");
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user analytics:", err);
      setError("Failed to load user analytics");
      toast.error("Failed to load user analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading && !userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading user analytics...</span>
      </div>
    );
  }

  if (error && !userData) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Ensure userData is loaded before rendering charts
  if (!userData) {
    return <div className="p-4">No user data available</div>;
  }

  const { users_by_location, users_by_role, most_active_users } = userData;

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">User Analytics</h2>
      {loading && userData && (
        <div className="flex items-center justify-center p-4 bg-muted/20 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>Updating user analytics...</span>
        </div>
      )}{" "}
      {/* User Role Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
        </CardHeader>        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={users_by_role}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {users_by_role.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} users`, "Count"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Users by Location Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Users by Location (India)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={users_by_location}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="locationName"
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Users" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Most Active Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Reports Submitted</th>
                </tr>
              </thead>
              <tbody>
                {most_active_users.map((user: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{user.username}</td>
                    <td className="p-2">{user.reportCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
