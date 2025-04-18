import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface LocationInfo {
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

interface EditLocationStepProps {
  locationInfo: LocationInfo;
  setLocationInfo: React.Dispatch<React.SetStateAction<LocationInfo>>;
}

// Define Leaflet objects for TypeScript
// These will be available at runtime when the Leaflet script is loaded
declare global {
  interface Window {
    L: any;
  }
}

export function EditLocationStep({
  locationInfo,
  setLocationInfo,
}: EditLocationStepProps) {
  const [showMap, setShowMap] = useState(
    locationInfo.latitude !== 0 && locationInfo.longitude !== 0
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const isMobile = useIsMobile();

  // Function to handle input changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle coordinate changes
  const handleCoordinateChange = (name: string, value: number) => {
    setLocationInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    setShowMap(true);
  };

  // Function to load Leaflet scripts and styles dynamically
  useEffect(() => {
    if (!showMap) return;

    // Check if Leaflet is already loaded
    if (window.L) {
      initMap();
      return;
    }

    // Load Leaflet CSS
    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkEl);

    // Load Leaflet JS
    const scriptEl = document.createElement("script");
    scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    scriptEl.onload = initMap;
    document.body.appendChild(scriptEl);

    return () => {
      // Cleanup if component unmounts before script loads
      scriptEl.onload = null;
    };
  }, [showMap, locationInfo.latitude, locationInfo.longitude]);

  // Initialize the map once Leaflet is loaded
  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    // If map already exists, remove it first
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Create a new map instance
    const map = window.L.map(mapRef.current).setView(
      [locationInfo.latitude || 20.5937, locationInfo.longitude || 78.9629],
      13
    );

    // Add tile layer (OpenStreetMap)
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a marker for the selected location
    const marker = window.L.marker(
      [locationInfo.latitude || 20.5937, locationInfo.longitude || 78.9629],
      { draggable: true }
    ).addTo(map);

    // Update coordinates when marker is dragged
    marker.on("dragend", function (e: any) {
      const position = marker.getLatLng();
      setLocationInfo((prev) => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng,
      }));
    });

    // Update marker and coordinates when map is clicked
    map.on("click", function (e: any) {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLocationInfo((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    });

    // Store references
    leafletMapRef.current = map;
    markerRef.current = marker;

    // Fix map display issue (Leaflet needs to recalculate dimensions)
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  // Function to handle getting current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info("Requesting your location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setLocationInfo((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          setShowMap(true);
          toast.success("Location acquired successfully");

          // Update the marker and map view if they exist
          if (leafletMapRef.current && markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            leafletMapRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Could not get your location. Please select manually or try again."
          );
          // Still show map to allow manual selection
          setShowMap(true);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      // Still show map to allow manual selection
      setShowMap(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            name="street"
            value={locationInfo.street}
            onChange={handleLocationChange}
            placeholder="123 Main St"
            required
            className="bg-transparent border-gray-700"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            name="district"
            value={locationInfo.district}
            onChange={handleLocationChange}
            placeholder="District/Area"
            className="bg-transparent border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={locationInfo.city}
            onChange={handleLocationChange}
            placeholder="City"
            required
            className="bg-transparent border-gray-700"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={locationInfo.state}
            onChange={handleLocationChange}
            placeholder="State"
            required
            className="bg-transparent border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={locationInfo.country}
            onChange={handleLocationChange}
            placeholder="Country"
            required
            className="bg-transparent border-gray-700"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={locationInfo.postalCode}
            onChange={handleLocationChange}
            placeholder="Postal Code"
            className="bg-transparent border-gray-700"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input
          id="landmark"
          name="landmark"
          value={locationInfo.landmark || ""}
          onChange={handleLocationChange}
          placeholder="Any nearby landmark"
          className="bg-transparent border-gray-700"
        />
      </div>

      <div className="mt-4 border-t border-gray-800 pt-4">
        <h3 className="font-medium mb-2">Map Location</h3>
        <p className="text-sm text-gray-400 mb-4">
          Use the map below to select the exact location for your report.
        </p>

        <div className="flex gap-4 mb-4">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              value={locationInfo.latitude || ""}
              onChange={(e) =>
                handleCoordinateChange(
                  "latitude",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="Latitude"
              className="bg-transparent border-gray-700"
              step="0.000001"
            />
          </div>

          <div className="grid gap-2 flex-1">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              value={locationInfo.longitude || ""}
              onChange={(e) =>
                handleCoordinateChange(
                  "longitude",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="Longitude"
              className="bg-transparent border-gray-700"
              step="0.000001"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            getCurrentLocation();
          }}
          variant="outline"
          className="flex items-center gap-2 mb-4"
        >
          <MapPin size={16} />
          Use my current location
        </Button>

        <Button
          type="button"
          onClick={() => setShowMap(true)}
          variant="outline"
          className={`flex items-center gap-2 mb-4 ${showMap ? "hidden" : ""}`}
        >
          Show Map
        </Button>

        {showMap && (
          <div
            ref={mapRef}
            className="mt-4 rounded-md overflow-hidden h-80 bg-gray-800 border border-gray-700"
            style={{ width: "100%" }}
          ></div>
        )}
      </div>
    </div>
  );
}
