import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocationAPI, ReportAPI, ImageAPI } from "@/lib/api-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormProgressIndicator,
  FormNavigation,
} from "@/components/petition-form";
import { EditBasicInfoStep } from "./EditBasicInfoStep";
import { EditLocationStep } from "./EditLocationStep";
import { EditImagesStep } from "./EditImagesStep";
import { ReportDetail, ReportCreate } from "@/lib/api-types";
// Types for form data
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

interface EditPetitionFormProps {
  report: ReportDetail;
  reportId: number;
}

export function EditPetitionForm({ report, reportId }: EditPetitionFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: report.title,
    description: report.description,
    category:
      report.categoryName && report.categoryID
        ? `${report.categoryName}|${report.categoryID}`
        : `${report.categoryID}|${report.categoryID}`,
  });

  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    street: report.street || "",
    district: "",
    city: report.city || "",
    state: report.state || "",
    country: report.country || "India",
    postalCode: "",
    landmark: "",
    latitude: report.latitude || 0,
    longitude: report.longitude || 0,
  });

  // Images state
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    report.images || []
  );
  const [newImages, setNewImages] = useState<ImageFile[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Mutation to update location
  const updateLocationMutation = useMutation({
    mutationFn: (
      locationData: Partial<LocationInfo> & { locationID: number }
    ) => {
      return LocationAPI.update(
        locationData.locationID,
        locationData,
        user?.id
      );
    },
    onSuccess: () => {
      console.log("Location updated successfully");
    },
    onError: (error) => {
      console.error("Error updating location:", error);
    },
  });

  // Mutation to update report
  const updateReportMutation = useMutation({
    mutationFn: ({
      reportId,
      reportData,
    }: {
      reportId: number;
      reportData: Partial<ReportCreate>;
    }) => {
      return ReportAPI.update(reportId, reportData, user?.id);
    },
    onSuccess: () => {
      console.log("Report updated successfully");
    },
    onError: (error) => {
      console.error("Error updating report:", error);
    },
  });

  // Mutation to delete images
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => {
      return ImageAPI.delete(imageId, user?.id);
    },
    onSuccess: () => {
      console.log("Image deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting image:", error);
    },
  });

  // Mutation to upload images
  const uploadImageMutation = useMutation({
    mutationFn: ({ file, reportId }: { file: File; reportId: number }) => {
      return ImageAPI.upload(reportId, file, user?.id);
    },
    onSuccess: () => {
      console.log("Image uploaded successfully");
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
    },
  });

  // Mutation to add URL images
  const addImageUrlMutation = useMutation({
    mutationFn: ({ url, reportId }: { url: string; reportId: number }) => {
      return ImageAPI.uploadUrl(reportId, url, user?.id);
    },
    onSuccess: () => {
      console.log("Image URL added successfully");
    },
    onError: (error) => {
      console.error("Error adding image URL:", error);
    },
  });

  // Handle form step navigation
  const nextStep = () => {
    if (isStepValid()) {
      setStep((prev) => Math.min(prev + 1, 3));
    } else {
      // Show appropriate validation error
      if (step === 1) {
        toast.error("Please complete all required fields in Basic Information");
      } else if (step === 2) {
        toast.error("Please complete all required fields in Location");
      }
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Validate current step
  const isStepValid = () => {
    if (step === 1) {
      return (
        basicInfo.title.trim() !== "" &&
        basicInfo.description.trim() !== "" &&
        basicInfo.category !== ""
      );
    }
    if (step === 2) {
      return (
        locationInfo.street.trim() !== "" &&
        locationInfo.city.trim() !== "" &&
        locationInfo.state.trim() !== "" &&
        locationInfo.country.trim() !== ""
      );
    }
    return true;
  };

  // Handle adding image URL
  const handleAddImageUrl = (url: string) => {
    setImageUrls((prev) => [...prev, url]);

    // Immediately display the image in the UI by adding it to existingImages
    // with a temporary ID
    const tempImage: ExistingImage = {
      imageID: -Date.now(), // Negative ID to avoid conflicts with real IDs
      imageURL: url,
      reportID: reportId,
      uploadedAt: new Date().toISOString(),
    };

    setExistingImages((prev) => [...prev, tempImage]);
  };

  // Submit form handler
  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be signed in to update this petition");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse the category ID from the format "categoryName|categoryID"
      let categoryID: number;

      if (basicInfo.category.includes("|")) {
        const categoryParts = basicInfo.category.split("|");
        categoryID = parseInt(categoryParts[1]);
      } else {
        // Fallback if the format is not as expected
        categoryID = parseInt(basicInfo.category);
      }

      if (isNaN(categoryID)) {
        console.error("Invalid category format:", basicInfo.category);
        toast.error("Invalid category format. Please select a valid category.");
        setIsSubmitting(false);
        return;
      }

      // 1. Update location
      await updateLocationMutation.mutateAsync({
        locationID: report.locationID,
        ...locationInfo,
      });

      // 2. Update report
      await updateReportMutation.mutateAsync({
        reportId,
        reportData: {
          title: basicInfo.title,
          description: basicInfo.description,
          categoryID,
        },
      });

      // 3. Handle images to delete - skip temporary images (which have negative IDs)
      for (const imageId of imagesToDelete.filter((id) => id > 0)) {
        await deleteImageMutation.mutateAsync(imageId);
      }

      // 4. Upload new images
      for (const imageItem of newImages) {
        await uploadImageMutation.mutateAsync({
          reportId,
          file: imageItem.file,
        });
      }

      // 5. Add URL images
      for (const url of imageUrls) {
        await addImageUrlMutation.mutateAsync({
          reportId,
          url,
        });
      }

      // Success!
      toast.success("Petition updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      navigate(`/reports/${reportId}`);
    } catch (error) {
      console.error("Failed to update petition:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the petition"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get title for current step
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Edit Basic Information";
      case 2:
        return "Edit Location Details";
      case 3:
        return "Edit Images";
      default:
        return "Edit Petition";
    }
  };

  // Render content for current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <EditBasicInfoStep
            basicInfo={basicInfo}
            setBasicInfo={setBasicInfo}
          />
        );
      case 2:
        return (
          <EditLocationStep
            locationInfo={locationInfo}
            setLocationInfo={setLocationInfo}
          />
        );
      case 3:
        return (
          <EditImagesStep
            newImages={newImages}
            existingImages={existingImages}
            imagesToDelete={imagesToDelete}
            setNewImages={setNewImages}
            setImagesToDelete={setImagesToDelete}
            onAddImageUrl={handleAddImageUrl}
            basicInfo={basicInfo}
            locationInfo={locationInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>{getStepTitle()}</CardTitle>
        <FormProgressIndicator currentStep={step} totalSteps={3} />
      </CardHeader>
      <CardContent>{renderStepContent()}</CardContent>
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <FormNavigation
          currentStep={step}
          totalSteps={3}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isNextDisabled={!isStepValid()}
          isSubmitting={isSubmitting}
        />
      </CardFooter>
    </Card>
  );
}
