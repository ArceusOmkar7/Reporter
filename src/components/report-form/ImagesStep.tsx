import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ImageFile {
  file: File;
  preview: string;
}

interface ExistingImage {
  imageID: number;
  imageURL: string;
  reportID: number;
  uploadedAt?: string;
}

interface BasicInfo {
  title: string;
  description: string;
  category: string;
}

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

interface ImagesStepProps {
  images: ImageFile[];
  existingImages?: ExistingImage[];
  basicInfo: BasicInfo;
  locationInfo: LocationInfo;
  onImageChange: (files: File[]) => void;
  onRemoveNewImage: (index: number) => void;
  onRemoveExistingImage?: (imageId: number) => void;
  onAddImageUrl?: (url: string) => void;
  editMode?: boolean;
}

export function ImagesStep({
  images,
  existingImages = [],
  onImageChange,
  onRemoveNewImage,
  onRemoveExistingImage,
  onAddImageUrl,
  basicInfo,
  locationInfo,
  editMode = false,
}: ImagesStepProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onImageChange(selectedFiles);
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl && onAddImageUrl) {
      onAddImageUrl(imageUrl);
      setImageUrl("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Label htmlFor="images">
          {editMode ? "Add More Images" : "Upload Images (Optional)"}
        </Label>

        <div className="flex space-x-2 mb-2">
          <Button
            type="button"
            variant={showUrlInput ? "secondary" : "default"}
            onClick={() => setShowUrlInput(false)}
            className="flex-1"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button
            type="button"
            variant={showUrlInput ? "default" : "secondary"}
            onClick={() => setShowUrlInput(true)}
            className="flex-1"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Image URL
          </Button>
        </div>

        {showUrlInput ? (
          <div className="flex gap-2">
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddImageUrl}
              disabled={!imageUrl}
            >
              Add URL
            </Button>
          </div>
        ) : (
          <div className="border border-dashed border-gray-700 rounded-md p-6 text-center">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <label htmlFor="images">
              <div className="flex flex-col items-center cursor-pointer">
                <ImagePlus size={40} className="text-gray-500 mb-2" />
                <p className="text-gray-400 mb-1">Click to select images</p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG, JPEG up to 5MB each
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Existing images section (only in edit mode) */}
      {editMode && existingImages.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">
            Existing Images ({existingImages.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {existingImages.map((image) => (
              <div key={image.imageID} className="relative">
                <img
                  src={image.imageURL}
                  alt={`Image ${image.imageID}`}
                  className="w-full h-40 object-cover rounded-md"
                />
                {onRemoveExistingImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => onRemoveExistingImage(image.imageID)}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images section */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">
            {editMode ? "New Images" : "Selected Images"} ({images.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={() => onRemoveNewImage(index)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!images.length && !existingImages.length && (
        <p className="text-gray-400 mt-4">
          No images selected. Images are optional but help illustrate your
          report.
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        Successfully uploaded images will be displayed here. You can remove
        images or add more before submitting the report.
      </p>

      <div className="mt-8 space-y-4 border-t border-gray-800 pt-6">
        <h3 className="font-medium">Preview Information</h3>

        <div>
          <h4 className="text-sm font-medium text-gray-400">Title</h4>
          <p className="mt-1">{basicInfo.title}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400">Description</h4>
          <p className="mt-1 text-sm">
            {basicInfo.description.substring(0, 150)}
            {basicInfo.description.length > 150 ? "..." : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400">Category</h4>
            <p className="mt-1">
              {basicInfo.category.split("|")[0] || "Not specified"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400">Location</h4>
            <p className="mt-1">
              {locationInfo.city}, {locationInfo.state}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
