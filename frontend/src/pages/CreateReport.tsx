import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LocationAPI, ReportAPI, ImageAPI } from "@/lib/api-service";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import {
  BasicInfoStep,
  LocationStep,
  ImagesStep,
  FormProgressIndicator,
  FormNavigation,
} from "@/components/report-form";

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

interface ImageURL {
  url: string;
}

const CreateReport = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Current form step
  const [step, setStep] = useState<number>(1);

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
    country: "India",
    postalCode: "",
    landmark: "",
    latitude: 0,
    longitude: 0,
  });

  // Selected images for upload
  const [images, setImages] = useState<ImageFile[]>([]);
  const [imageUrls, setImageUrls] = useState<ImageURL[]>([]);

  // Form submission status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be signed in to create a report");
      navigate("/signin", { state: { from: "/new" } });
    }
  }, [isAuthenticated, navigate]);

  // Mutation to create location
  const locationMutation = useMutation({
    mutationFn: (
      locationData: Omit<LocationInfo, "landmark"> & { landmark?: string }
    ) => {
      return LocationAPI.create(locationData, user?.id);
    },
  });

  // Mutation to create report
  const reportMutation = useMutation({
    mutationFn: ({
      title,
      description,
      categoryID,
      locationID,
    }: {
      title: string;
      description: string;
      categoryID: number;
      locationID: number;
    }) => {
      return ReportAPI.create(
        {
          title,
          description,
          categoryID,
          locationID,
        },
        user?.id
      );
    },
  });

  // Mutation to upload image file
  const imageMutation = useMutation({
    mutationFn: ({ reportId, file }: { reportId: number; file: File }) => {
      return ImageAPI.upload(reportId, file, user?.id);
    },
  });

  // Mutation to upload image URL
  const imageUrlMutation = useMutation({
    mutationFn: ({ reportId, url }: { reportId: number; url: string }) => {
      return ImageAPI.uploadUrl(reportId, url, user?.id);
    },
  });

  // Handle basic info changes
  const handleBasicInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setBasicInfo((prev) => ({ ...prev, category: value }));
  };

  // Handle location info changes
  const handleLocationInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Update function to accept latitude and longitude directly
  const handleCoordinateChange = (latitude: number, longitude: number) => {
    setLocationInfo((prev) => ({ ...prev, latitude, longitude }));
  };

  // Handle image file selection
  const handleImageFiles = (files: File[]) => {
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newFiles]);
  };

  // Handle image URL addition
  const handleAddImageUrl = (url: string) => {
    setImageUrls((prev) => [...prev, { url }]);
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Remove a URL image
  const removeUrlImage = (index: number) => {
    setImageUrls((prev) => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  // Next step handler
  const nextStep = () => {
    if (step === 1) {
      // Validate basic info
      if (!basicInfo.title.trim()) {
        toast.error("Please enter a title for your report");
        return;
      }
      if (!basicInfo.description.trim()) {
        toast.error("Please enter a description for your report");
        return;
      }
      if (!basicInfo.category) {
        toast.error("Please select a category for your report");
        return;
      }
    } else if (step === 2) {
      // Validate location info
      if (!locationInfo.street.trim()) {
        toast.error("Please enter a street address");
        return;
      }
      if (!locationInfo.city.trim()) {
        toast.error("Please enter a city");
        return;
      }
      if (!locationInfo.state.trim()) {
        toast.error("Please enter a state");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  // Previous step handler
  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be signed in to create a report");
      navigate("/signin", { state: { from: "/new" } });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find category ID from name
      const categoryParts = basicInfo.category.split("|");
      const categoryID = parseInt(categoryParts[1]);

      if (isNaN(categoryID)) {
        toast.error("Invalid category selected");
        setIsSubmitting(false);
        return;
      }

      // 1. Create location
      const locationResponse = await locationMutation.mutateAsync(locationInfo);
      const locationID = locationResponse.id;

      if (!locationID) {
        throw new Error("Failed to create location");
      }

      // 2. Create report
      const reportResponse = await reportMutation.mutateAsync({
        title: basicInfo.title,
        description: basicInfo.description,
        categoryID,
        locationID: locationID,
      });

      const reportID = reportResponse.id;

      if (!reportID) {
        throw new Error("Failed to create report");
      }

      // 3. Upload file images (if any)
      if (images.length > 0) {
        toast.info(`Uploading ${images.length} images...`);

        for (const imageItem of images) {
          await imageMutation.mutateAsync({
            reportId: reportID,
            file: imageItem.file,
          });
        }
      }

      // 4. Add URL images (if any)
      if (imageUrls.length > 0) {
        toast.info(`Adding ${imageUrls.length} image URLs...`);

        for (const imageItem of imageUrls) {
          await imageUrlMutation.mutateAsync({
            reportId: reportID,
            url: imageItem.url,
          });
        }
      }

      toast.success("Report created successfully!");
      navigate(`/reports/${reportID}`);
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create report"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  // Get title for current step
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Location Details";
      case 3:
        return "Add Images";
      default:
        return "";
    }
  };

  // Render content for current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <BasicInfoStep
            basicInfo={basicInfo}
            onBasicInfoChange={handleBasicInfoChange}
            onCategoryChange={handleCategoryChange}
          />
        );
      case 2:
        return (
          <LocationStep
            locationInfo={locationInfo}
            onLocationChange={handleLocationInfoChange}
            onCoordinateChange={handleCoordinateChange}
          />
        );
      case 3:
        return (
          <ImagesStep
            images={images}
            onImageChange={handleImageFiles}
            onRemoveNewImage={removeImage}
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
    <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <FormProgressIndicator currentStep={step} totalSteps={3} />
        </div>

        <Card className="dark:bg-gray-800/60 bg-gray-50 dark:border-gray-700 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center dark:text-gray-100 text-gray-800">
              {getStepTitle()}
            </CardTitle>
          </CardHeader>

          <CardContent>{renderStepContent()}</CardContent>

          <CardFooter className="dark:border-gray-700 border-gray-200 pt-6">
            <FormNavigation
              currentStep={step}
              totalSteps={3}
              onPrev={prevStep}
              onNext={nextStep}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              isSubmitting={isSubmitting}
            />
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default CreateReport;
