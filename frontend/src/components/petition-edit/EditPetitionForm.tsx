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
import { ReportDetail } from "@/lib/api-types";
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
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Current form step
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Form data for each step
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: "",
    description: "",
    category: "",
  });

  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    street: "",
    district: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    landmark: "",
    latitude: 0,
    longitude: 0,
  });

  const [newImages, setNewImages] = useState<ImageFile[]>([]);

  // Load initial form data
  useEffect(() => {
    if (report) {
      // Set form data based on the existing report
      setBasicInfo({
        title: report.title,
        description: report.description,
        category: report.categoryID.toString(),
      });

      setLocationInfo({
        street: report.street || "",
        district: "", // Not available in ReportDetail
        city: report.city || "",
        state: report.state || "",
        country: report.country || "",
        postalCode: "", // Not available in ReportDetail
        landmark: "", // Not available in ReportDetail
        latitude: report.latitude || 0,
        longitude: report.longitude || 0,
      });

      if (report.images && report.images.length > 0) {
        setExistingImages(report.images);
      }
    }
  }, [report]);

  // Mutation to update report
  const reportMutation = useMutation({
    mutationFn: ({
      title,
      description,
      categoryID,
    }: {
      title: string;
      description: string;
      categoryID: number;
    }) => {
      return ReportAPI.update(
        reportId,
        {
          title,
          description,
          categoryID,
          locationID: report.locationID,
        },
        user?.id
      );
    },
  });

  // Mutation to update location
  const locationMutation = useMutation({
    mutationFn: (
      locationData: Omit<LocationInfo, "landmark"> & { landmark?: string }
    ) => {
      return LocationAPI.update(report.locationID, locationData, user?.id);
    },
  });

  // Mutation for images
  const imageMutation = useMutation({
    mutationFn: ({ reportId, file }: { reportId: number; file: File }) => {
      return ImageAPI.upload(reportId, file, user?.id);
    },
  });

  // Mutation to delete images
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => {
      return ImageAPI.delete(imageId, user?.id);
    },
  });

  // Navigate between steps
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Form validation for each step
  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          basicInfo.title.trim() !== "" &&
          basicInfo.description.trim() !== "" &&
          basicInfo.category !== ""
        );
      case 2:
        return (
          locationInfo.street.trim() !== "" &&
          locationInfo.city.trim() !== "" &&
          locationInfo.state.trim() !== "" &&
          locationInfo.country.trim() !== ""
        );
      case 3:
        return true; // Images are optional
      default:
        return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast("Please sign in to update a petition");
      navigate("/signin");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get category ID from selected option
      const categoryID = parseInt(basicInfo.category);

      // 1. Update the location data
      await locationMutation.mutateAsync({
        street: locationInfo.street,
        district: locationInfo.district,
        city: locationInfo.city,
        state: locationInfo.state,
        country: locationInfo.country,
        postalCode: locationInfo.postalCode,
        landmark: locationInfo.landmark || undefined,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
      });

      // 2. Update the report
      await reportMutation.mutateAsync({
        title: basicInfo.title,
        description: basicInfo.description,
        categoryID,
      });

      // 3. Delete marked images
      if (imagesToDelete.length > 0) {
        toast.info(`Removing ${imagesToDelete.length} images...`);

        for (const imageId of imagesToDelete) {
          await deleteImageMutation.mutateAsync(imageId);
        }
      }

      // 4. Upload new images (if any)
      if (newImages.length > 0) {
        toast.info(`Uploading ${newImages.length} images...`);

        for (const imageItem of newImages) {
          await imageMutation.mutateAsync({
            reportId,
            file: imageItem.file,
          });
        }
      }

      // 5. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });

      toast.success("Petition updated successfully!");
      navigate(`/reports/${reportId}`);
    } catch (error) {
      console.error("Error updating petition:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update petition"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      newImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [newImages]);

  // Get title for current step
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Location Details";
      case 3:
        return "Manage Images";
      default:
        return "Edit Petition";
    }
  };

  // Render the current step content
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
