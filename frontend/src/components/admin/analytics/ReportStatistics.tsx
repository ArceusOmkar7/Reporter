/**
 * Report Statistics Component
 *
 * Displays various visualizations for report data:
 * - Reports by category (pie chart)
 * - Reports by location (bar chart)
 * - Reports trend over time (line chart)
 */
import { useState, useEffect } from "react";
import { AnalyticsAPI } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PieChart, BarChart } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Sector,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
];

export function ReportStatistics() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AnalyticsAPI.getReportAnalytics();
        setReportData(data);
      } catch (err) {
        console.error("Error fetching report statistics:", err);
        setError("Failed to load report statistics");
        toast.error("Failed to load report statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading report statistics...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Ensure reportData is loaded before rendering charts
  if (!reportData) {
    return <div className="p-4">No report data available</div>;
  }

  const {
    reports_by_category,
    reports_by_location,
    reports_trend,
    recent_reports,
  } = reportData;

  // Format data for charts
  const categoryChartData = reports_by_category.map((item: any) => ({
    name: item.categoryName,
    value: item.count,
  }));

  // Take top 10 locations for the bar chart
  const locationChartData = reports_by_location.slice(0, 10);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Report Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} reports`, "Count"]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reports by Location Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Reporting Locations</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={locationChartData}
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
                <Bar dataKey="count" name="Reports" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reports Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={reports_trend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Reports"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Reported By</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_reports.map((report: any) => (
                  <tr
                    key={report.reportID}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-2">{report.reportID}</td>
                    <td className="p-2 font-medium">{report.title}</td>
                    <td className="p-2">{report.categoryName || "N/A"}</td>
                    <td className="p-2">{report.location}</td>
                    <td className="p-2">{report.username || "Anonymous"}</td>
                    <td className="p-2">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
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
