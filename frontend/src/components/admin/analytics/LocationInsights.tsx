/**
 * Location Insights Component
 *
 * Displays visualizations for location-based insights:
 * - Map visualization of report distribution with heatmap
 * - Reports by state comparison
 * - Top reporting cities
 * - Location trends over time
 */
import { useState, useEffect, useRef } from "react";
import { AnalyticsAPI } from "@/lib/api-service";
import { API_BASE_URL } from "@/lib/api-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Filter } from "lucide-react";
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
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnalyticsDateFilter, TimePeriod } from "./AnalyticsDateFilter";

// Fix Leaflet default icon issues
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HeatMapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

interface StateReport {
  name: string;
  value: number;
  latitude: number;
  longitude: number;
}

interface CityReport {
  name: string;
  state: string;
  value: number;
  latitude: number;
  longitude: number;
}

interface LocationData {
  heat_map_data: HeatMapPoint[];
  reports_by_state: StateReport[];
  top_cities: CityReport[];
}

interface FilteredHeatmapData {
  heat_map_data: HeatMapPoint[];
  metadata: {
    total_points: number;
    total_reports: number;
    hotspot_count: number;
    filters_applied: {
      start_date: string | null;
      end_date: string | null;
      category_id: number | null;
    };
  };
}

interface LocationTrends {
  trend_data: any[];
  top_states: string[];
}

export function LocationInsights() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTrends, setLoadingTrends] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [filteredHeatmapData, setFilteredHeatmapData] =
    useState<FilteredHeatmapData | null>(null);
  const [locationTrends, setLocationTrends] = useState<LocationTrends | null>(
    null
  );
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [timeAggregation, setTimeAggregation] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");

  // Filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>(
    "all"
  );
  const [isFiltered, setIsFiltered] = useState<boolean>(false);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AnalyticsAPI.getLocationInsights();
        setLocationData(data);

        // Fetch categories for filtering
        try {
          const res = await fetch(`${API_BASE_URL}/api/category/`);
          const categoriesData = await res.json();
          if (Array.isArray(categoriesData)) {
            setCategories(
              categoriesData.map((cat) => ({
                id: cat.categoryID,
                name: cat.categoryName,
              }))
            );
          }
        } catch (err) {
          console.error("Failed to load categories:", err);
        }

        // Also fetch location trends
        await fetchLocationTrends(timeAggregation);
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

  const fetchLocationTrends = async (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  ) => {
    try {
      setLoadingTrends(true);
      const trendData = await AnalyticsAPI.getLocationTrends(period);
      setLocationTrends(trendData);
    } catch (err) {
      console.error("Error fetching location trends:", err);
      toast.error("Failed to load location trends");
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleFilterApply = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (selectedCategory && selectedCategory !== "all")
        filters.categoryId = selectedCategory;

      const filteredData = await AnalyticsAPI.getFilteredHeatmapData(filters);
      setFilteredHeatmapData(filteredData);
      setIsFiltered(true);

      // Update the map with new data
      updateMapWithData(filteredData.heat_map_data);
    } catch (err) {
      console.error("Error applying filters:", err);
      toast.error("Failed to apply filters");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setStartDate("");
    setEndDate("");
    setSelectedCategory("all");
    setIsFiltered(false);
    setFilteredHeatmapData(null);

    // Reset the map with original data
    if (locationData) {
      updateMapWithData(locationData.heat_map_data);
    }
  };

  const updateMapWithData = (heatMapData: HeatMapPoint[]) => {
    if (!mapRef.current) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    if (heatMapData && heatMapData.length > 0) {
      const heatData = heatMapData.map((point) => [
        point.latitude,
        point.longitude,
        point.weight,
      ]);

      // @ts-ignore - type definitions for leaflet.heat are not perfect
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: Math.max(...heatMapData.map((p) => p.weight)),
        gradient: { 0.4: "blue", 0.65: "lime", 1: "red" },
      }).addTo(mapRef.current);
    }
  };

  // Initialize map when data is loaded
  useEffect(() => {
    if (!locationData || !mapContainerRef.current) return;

    // Clear previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Initialize map centered on India
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Process heat map data for Leaflet.heat
    if (locationData.heat_map_data && locationData.heat_map_data.length > 0) {
      const heatData = locationData.heat_map_data.map((point) => [
        point.latitude,
        point.longitude,
        point.weight,
      ]);

      // @ts-ignore - type definitions for leaflet.heat are not perfect
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: Math.max(...locationData.heat_map_data.map((p) => p.weight)),
        gradient: { 0.4: "blue", 0.65: "lime", 1: "red" },
      }).addTo(map);

      // Add markers for top cities
      locationData.top_cities.slice(0, 10).forEach((city) => {
        if (city.latitude && city.longitude) {
          L.marker([city.latitude, city.longitude])
            .addTo(map)
            .bindPopup(
              `<b>${city.name}, ${city.state}</b><br>Reports: ${city.value}`
            );
        }
      });
    }

    // Clean up on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [locationData]);

  if (loading && !locationData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading location insights...</span>
      </div>
    );
  }

  if (error && !locationData) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Ensure locationData is loaded before rendering charts
  if (!locationData) {
    return <div className="p-4">No location data available</div>;
  }

  const { reports_by_state, top_cities } = locationData;

  // Take top 15 states for the chart
  const stateChartData = reports_by_state.slice(0, 15);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Location-Based Insights</h2>

      {/* Map with heatmap using Leaflet */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Reports Distribution Map</CardTitle>

          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 z-[9999]">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filter Heatmap</h4>
                    <p className="text-sm text-muted-foreground">
                      Apply filters to visualize specific timeframes or
                      categories
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={selectedCategory?.toString()}
                        onValueChange={(val) =>
                          setSelectedCategory(
                            val === "all" ? "all" : Number(val)
                          )
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset
                    </Button>
                    <Button onClick={handleFilterApply}>Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            ref={mapContainerRef}
            className="rounded-md h-[500px] w-full relative z-0"
          />

          {isFiltered && filteredHeatmapData && (
            <div className="mt-2 text-sm bg-muted/20 p-3 rounded-md">
              <h4 className="font-medium">Filter Results</h4>
              <div className="grid grid-cols-3 mt-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Total Reports:</span>
                  <div className="font-medium">
                    {filteredHeatmapData.metadata.total_reports}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Points:</span>
                  <div className="font-medium">
                    {filteredHeatmapData.metadata.total_points}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Hotspots:</span>
                  <div className="font-medium">
                    {filteredHeatmapData.metadata.hotspot_count}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isFiltered && (
            <p className="text-sm text-muted-foreground mt-2">
              Heat map showing report density. Markers indicate top reporting
              cities.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Location Trends Over Time */}
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Location Trends Over Time</CardTitle>
            <Select
              value={timeAggregation}
              onValueChange={(
                val: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
              ) => {
                setTimeAggregation(val);
                fetchLocationTrends(val);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-center gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="trend-start-date">Start Date</Label>
                <Input
                  id="trend-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="trend-end-date">End Date</Label>
                <Input
                  id="trend-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 self-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLocationTrends(timeAggregation)}
              >
                Apply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchLocationTrends(timeAggregation);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loadingTrends ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading trends...</span>
            </div>
          ) : locationTrends?.trend_data &&
            locationTrends.trend_data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={locationTrends.trend_data}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {locationTrends.top_states.map((state, index) => (
                  <Line
                    key={state}
                    type="monotone"
                    dataKey={state}
                    name={state}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No trend data available
            </div>
          )}
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
