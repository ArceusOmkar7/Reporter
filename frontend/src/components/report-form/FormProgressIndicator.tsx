import { cn } from "@/lib/utils";

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function FormProgressIndicator({
  currentStep,
  totalSteps = 3,
}: FormProgressIndicatorProps) {
  const steps = [
    { id: 1, name: "Basic Info" },
    { id: 2, name: "Location" },
    { id: 3, name: "Images" },
  ].slice(0, totalSteps);

  return (
    <div className="flex items-center justify-center">
      <ol className="flex w-full max-w-[400px] items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "relative flex w-full items-center",
              index === steps.length - 1
                ? ""
                : "after:content-[''] after:w-full after:h-[2px] after:border-b after:border-gray-700 after:border-1 after:inline-block"
            )}
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm border",
                  step.id === currentStep
                    ? "bg-white text-black border-white"
                    : step.id < currentStep
                    ? "bg-gray-700 text-white border-gray-700"
                    : "bg-transparent text-gray-500 border-gray-700"
                )}
              >
                {step.id < currentStep ? "✓" : step.id}
              </span>
              <span
                className={cn(
                  "absolute top-10 text-xs whitespace-nowrap",
                  step.id === currentStep ? "text-white" : "text-gray-500"
                )}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
