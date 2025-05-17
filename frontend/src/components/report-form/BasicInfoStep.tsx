import { useQuery } from "@tanstack/react-query";
import { CategoryAPI } from "@/lib/api-service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfo {
  title: string;
  description: string;
  category: string;
}

interface BasicInfoStepProps {
  basicInfo: BasicInfo;
  onBasicInfoChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCategoryChange: (value: string) => void;
}

export function BasicInfoStep({
  basicInfo,
  onBasicInfoChange,
  onCategoryChange,
}: BasicInfoStepProps) {
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const data = await CategoryAPI.getAll();
        return data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Petition Title</Label>
        <Input
          id="title"
          name="title"
          value={basicInfo.title}
          onChange={onBasicInfoChange}
          placeholder="Enter a clear, specific title"
          required
          className="bg-transparent border-gray-700"
        />
        <p className="text-sm text-gray-400">
          Be specific and summarize your issue
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Petition Description</Label>
        <Textarea
          id="description"
          name="description"
          value={basicInfo.description}
          onChange={onBasicInfoChange}
          placeholder="Describe your issue in detail..."
          required
          className="min-h-[200px] bg-transparent border-gray-700"
        />
        <p className="text-sm text-gray-400">
          Explain the issue, why it matters, and what change you want to see
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select value={basicInfo.category} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-transparent border-gray-700">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {isLoadingCategories ? (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            ) : (
              categories?.map((category: any) => (
                <SelectItem
                  key={category.categoryID}
                  value={`${category.categoryName}|${category.categoryID}`}
                >
                  {category.categoryName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-400">
          Choose the most relevant category for your petition
        </p>
      </div>
    </div>
  );
}
