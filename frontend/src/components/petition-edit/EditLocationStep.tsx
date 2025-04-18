import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

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

export function EditLocationStep({
  locationInfo,
  setLocationInfo,
}: EditLocationStepProps) {
  const [showMap, setShowMap] = useState(
    locationInfo.latitude !== 0 && locationInfo.longitude !== 0
  );

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

  // Function to handle getting current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationInfo((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setShowMap(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Could not get your current location. Please enter manually or try again."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
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
          Provide the exact location by setting coordinates manually or using
          your current location.
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

        <button
          type="button"
          onClick={getCurrentLocation}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
        >
          <MapPin size={16} className="mr-1" />
          Use my current location
        </button>

        {showMap &&
          locationInfo.latitude !== 0 &&
          locationInfo.longitude !== 0 && (
            <div className="mt-4 rounded-md overflow-hidden h-64 bg-gray-800">
              <iframe
                title="Report location"
                width="100%"
                height="100%"
                src={`https://maps.google.com/maps?q=${locationInfo.latitude},${locationInfo.longitude}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          )}
      </div>
    </div>
  );
}
