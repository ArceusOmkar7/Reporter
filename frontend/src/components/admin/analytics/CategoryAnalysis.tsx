/**
 * Category Analysis Component
 *
 * Displays visualizations for category-based insights:
 * - Most reported categories
 * - Category trend analysis over time
 * - Category distribution by location
 */
import { useState, useEffect } from "react";
import { AnalyticsAPI } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnalyticsDateFilter, TimePeriod } from "./AnalyticsDateFilter";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

export function CategoryAnalysis() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [period, setPeriod] = useState<TimePeriod>("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchCategoryData = async (
    selectedPeriod: TimePeriod = "monthly",
    start?: string,
    end?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsAPI.getCategoryAnalysis(
        selectedPeriod,
        start,
        end
      );
      setCategoryData(data);

      // Set default selected category to the most reported one
      if (
        data.most_reported_categories &&
        data.most_reported_categories.length > 0
      ) {
        setSelectedCategory(data.most_reported_categories[0].name);
      }
    } catch (err) {
      console.error("Error fetching category analysis:", err);
      setError("Failed to load category analysis");
      toast.error("Failed to load category analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    fetchCategoryData(newPeriod, startDate, endDate);
  };

  const handleDateRangeApply = () => {
    fetchCategoryData(period, startDate, endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchCategoryData(period);
  };

  if (loading && !categoryData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading category analysis...</span>
      </div>
    );
  }

  if (error && !categoryData) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Ensure categoryData is loaded before rendering charts
  if (!categoryData) {
    return <div className="p-4">No category data available</div>;
  }

  const { most_reported_categories, category_trends, category_by_location } =
    categoryData;

  // Process category trends data for the line chart
  const processedTrendData = [];
  const months = Array.from(
    new Set(category_trends.map((item: any) => item.period_date))
  ).sort();

  months.forEach((month: any) => {
    const monthData: any = { month };
    category_trends
      .filter((item: any) => item.period_date === month)
      .forEach((item: any) => {
        monthData[item.categoryName] = item.count;
      });
    processedTrendData.push(monthData);
  });

  // Get location data for the selected category
  const locationDataForCategory = category_by_location
    .filter((item: any) => item.categoryName === selectedCategory)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10); // Top 10 states for this category

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Category Analysis</h2>
      {/* Period selector and date range filters */}
      <AnalyticsDateFilter
        period={period}
        startDate={startDate}
        endDate={endDate}
        loading={loading}
        onPeriodChange={handlePeriodChange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApplyFilters={handleDateRangeApply}
        onReset={handleReset}
      />
      {loading && categoryData && (
        <div className="flex items-center justify-center p-4 bg-muted/20 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>Updating category analysis...</span>
        </div>
      )}
      {/* Most Reported Categories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Most Reported Categories</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={most_reported_categories}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${value} reports`, "Count"]}
              />
              <Legend />
              <Bar
                dataKey="value"
                name="Reports"
                fill="#8884d8"
                onClick={(data) => setSelectedCategory(data.name)}
                cursor="pointer"
              >
                {most_reported_categories.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === selectedCategory ? "#ff8042" : "#8884d8"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>{" "}
      {/* Category Trends Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>
            {period === "daily" && "Category Trends (Last 30 Days)"}
            {period === "weekly" && "Category Trends (Last 12 Weeks)"}
            {period === "monthly" && "Category Trends (Last 12 Months)"}
            {period === "quarterly" && "Category Trends (Last 8 Quarters)"}
            {period === "yearly" && "Category Trends (Last 5 Years)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={processedTrendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              {" "}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Handle different period formats
                  if (!value) return "";

                  // For quarterly data (format YYYY-Q#)
                  if (
                    period === "quarterly" &&
                    typeof value === "string" &&
                    value.includes("Q")
                  ) {
                    return value;
                  }

                  // For yearly data
                  if (
                    period === "yearly" &&
                    typeof value === "string" &&
                    !value.includes("-")
                  ) {
                    return value;
                  }

                  return value;
                }}
              />
              <YAxis />{" "}
              <Tooltip
                labelFormatter={(value) => {
                  // Just return the value for all formats since we don't need to parse dates here
                  return value;
                }}
              />
              <Legend />
              {most_reported_categories
                .slice(0, 5)
                .map((category: any, index: number) => (
                  <Line
                    key={category.name}
                    type="monotone"
                    dataKey={category.name}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={category.name === selectedCategory ? 3 : 1}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Category by Location Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory
              ? `${selectedCategory} Reports by State`
              : "Select a category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCategory ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={locationDataForCategory}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="state"
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `${value} reports`,
                    `${selectedCategory} Reports`,
                  ]}
                />
                <Legend />
                <Bar dataKey="count" name="Reports" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground p-6">
              Select a category from the chart above to see its distribution by
              state
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
