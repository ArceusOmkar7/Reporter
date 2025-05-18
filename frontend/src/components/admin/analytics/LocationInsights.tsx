/**
 * Location Insights Component
 *
 * Displays visualizations for location-based insights:
 * - Map visualization of report distribution
 * - Reports by state comparison
 * - Top reporting cities
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
  ComposedChart,
  Area,
} from "recharts";

export function LocationInsights() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<any>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AnalyticsAPI.getLocationInsights();
        setLocationData(data);
      } catch (err) {
        console.error("Error fetching location insights:", err);
        setError("Failed to load location insights");
        toast.error("Failed to load location insights");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading location insights...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Ensure locationData is loaded before rendering charts
  if (!locationData) {
    return <div className="p-4">No location data available</div>;
  }

  const { reports_by_state, top_cities, heat_map_data } = locationData;

  // Take top 15 states for the chart
  const stateChartData = reports_by_state.slice(0, 15);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Location-Based Insights</h2>

      {/* India Map Placeholder (for actual implementation, consider using a mapping library like react-simple-maps) */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Distribution Map</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-muted/20 border rounded-md p-6 flex flex-col items-center justify-center h-[400px]">
            <p className="text-muted-foreground mb-2">
              Map visualization would be displayed here
            </p>
            <p className="text-sm text-muted-foreground">
              Consider implementing with a library like react-simple-maps or
              Google Maps API
            </p>
            <p className="text-sm mt-4">
              Heat map data available: {heat_map_data.length} location points
              with report counts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reports by State Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Reports by State</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={stateChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${value} reports`, "Count"]}
              />
              <Legend />
              <Bar dataKey="value" name="Reports" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Reporting Cities */}
      <Card>
        <CardHeader>
          <CardTitle>Top Reporting Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">City</th>
                  <th className="text-left p-2">State</th>
                  <th className="text-left p-2">Report Count</th>
                  <th className="text-left p-2">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {top_cities.map((city: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{city.name}</td>
                    <td className="p-2">{city.state}</td>
                    <td className="p-2">{city.value}</td>
                    <td className="p-2">
                      {city.latitude
                        ? `${city.latitude}, ${city.longitude}`
                        : "N/A"}
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
