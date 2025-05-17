import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X, Save } from "lucide-react";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isNextDisabled?: boolean;
  isSubmitting: boolean;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  onCancel,
  isNextDisabled = false,
  isSubmitting,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between w-full">
      <div>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
            className="bg-transparent border-gray-700 hover:bg-gray-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-white text-black hover:bg-gray-200"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-1 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className="bg-white text-black hover:bg-gray-200"
          >
            Next Step
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
