import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Info, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ImageWithFallback";

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

interface EditImagesStepProps {
  newImages: ImageFile[];
  existingImages: ExistingImage[];
  imagesToDelete: number[];
  setNewImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  setImagesToDelete: React.Dispatch<React.SetStateAction<number[]>>;
  onAddImageUrl?: (url: string) => void;
  basicInfo: BasicInfo;
  locationInfo: LocationInfo;
}

export function EditImagesStep({
  newImages,
  existingImages,
  imagesToDelete,
  setNewImages,
  setImagesToDelete,
  onAddImageUrl,
  basicInfo,
  locationInfo,
}: EditImagesStepProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Handle image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const imageFiles = selectedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setNewImages((prev) => [...prev, ...imageFiles]);
    }
  };

  // Handle adding image via URL
  const handleAddImageUrl = () => {
    if (imageUrl && onAddImageUrl) {
      onAddImageUrl(imageUrl);
      setImageUrl("");
    }
  };

  // Handle removing new image
  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview); // Clean up preview URL
      updated.splice(index, 1);
      return updated;
    });
  };

  // Handle removing existing image
  const handleRemoveExistingImage = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  // Handle undoing removal of existing image
  const handleUndoRemoveImage = (imageId: number) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  // Filter existing images to show only those not marked for deletion
  const displayedExistingImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img.imageID)
  );

  // Images marked for deletion
  const deletedImages = existingImages.filter((img) =>
    imagesToDelete.includes(img.imageID)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Label htmlFor="images">Add More Images</Label>

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && imageUrl) {
                  handleAddImageUrl();
                }
              }}
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
              onChange={handleImageChange}
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

      {/* Existing images section */}
      {displayedExistingImages.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">
            Existing Images ({displayedExistingImages.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {displayedExistingImages.map((image) => (
              <div key={image.imageID} className="relative">
                <ImageWithFallback
                  src={image.imageURL}
                  alt={`Image ${image.imageID}`}
                  className="w-full h-40 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveExistingImage(image.imageID)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images section */}
      {newImages.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">New Images ({newImages.length})</h3>
          <div className="grid grid-cols-2 gap-4">
            {newImages.map((image, index) => (
              <div key={index} className="relative">
                <ImageWithFallback
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveNewImage(index)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deleted images section */}
      {deletedImages.length > 0 && (
        <div className="mt-6 border-t border-gray-800 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium">
              Images To Remove ({deletedImages.length})
            </h3>
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              These images will be deleted when you save
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 opacity-60">
            {deletedImages.map((image) => (
              <div key={image.imageID} className="relative">
                <ImageWithFallback
                  src={image.imageURL}
                  alt={`Image ${image.imageID}`}
                  className="w-full h-40 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => handleUndoRemoveImage(image.imageID)}
                >
                  Undo Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!newImages.length && !displayedExistingImages.length && (
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
        <h3 className="font-medium">Report Summary</h3>

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
          {basicInfo.category && (
            <div>
              <h4 className="text-sm font-medium text-gray-400">Category</h4>
              <p className="mt-1">
                {basicInfo.category.split("|")[0] || "Not specified"}
              </p>
            </div>
          )}

          {locationInfo.city && locationInfo.state && (
            <div>
              <h4 className="text-sm font-medium text-gray-400">Location</h4>
              <p className="mt-1">
                {locationInfo.city}, {locationInfo.state}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
