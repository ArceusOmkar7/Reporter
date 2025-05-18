/**
 * System Performance Component
 *
 * Displays visualizations for system performance metrics:
 * - User engagement metrics
 * - Daily activity patterns
 * - Monthly growth rates
 */
import { useState, useEffect } from "react";
import { AnalyticsAPI } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
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
  LineChart,
  Line,
  Area,
  AreaChart,
  Cell,
} from "recharts";

export function SystemPerformance() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AnalyticsAPI.getSystemPerformance();
        setPerformanceData(data);
      } catch (err) {
        console.error("Error fetching system performance metrics:", err);
        setError("Failed to load system performance metrics");
        toast.error("Failed to load system performance metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading system performance metrics...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Ensure performanceData is loaded before rendering charts
  if (!performanceData) {
    return <div className="p-4">No performance data available</div>;
  }

  const { user_engagement, hourly_activity, monthly_growth } = performanceData;

  // Calculate overall growth trend
  const overallGrowth =
    monthly_growth.reduce(
      (sum: number, month: any) => sum + month.growth_percent,
      0
    ) / monthly_growth.length;

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">System Performance Metrics</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Reports Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {user_engagement?.avg_reports_per_user
                ? user_engagement.avg_reports_per_user.toFixed(2)
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-3xl font-bold mr-2">
                {overallGrowth ? `${overallGrowth.toFixed(2)}%` : "N/A"}
              </span>
              {overallGrowth >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Peak Activity Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hourly_activity.length > 0
                ? `${
                    hourly_activity.reduce(
                      (max: any, hour: any) =>
                        hour.count > max.count ? hour : max,
                      { count: 0 }
                    ).hour
                  }:00`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Pattern (Reports by Hour)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={hourly_activity}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${value} reports`, "Count"]}
                labelFormatter={(hour) => `Hour: ${hour}:00`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="count"
                name="Reports"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Growth Rate</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthly_growth}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [
                  `${value.toFixed(2)}%`,
                  "Growth Rate",
                ]}
              />
              <Legend />
              <Bar dataKey="growth_percent" name="Growth %" fill="#8884d8">
                {monthly_growth.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.growth_percent >= 0 ? "#82ca9d" : "#ff8042"}
                  />
                ))}
              </Bar>
              <Bar dataKey="count" name="Reports" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Report Count */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report Counts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthly_growth}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="Current Month"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="prev_month_count"
                name="Previous Month"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
