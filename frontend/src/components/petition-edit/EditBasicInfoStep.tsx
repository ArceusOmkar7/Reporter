import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryAPI } from "@/lib/api-service";
import { CategoryBase } from "@/lib/api-types";
import { useQuery } from "@tanstack/react-query";

interface BasicInfo {
  title: string;
  description: string;
  category: string;
}

interface EditBasicInfoStepProps {
  basicInfo: BasicInfo;
  setBasicInfo: React.Dispatch<React.SetStateAction<BasicInfo>>;
}

export function EditBasicInfoStep({
  basicInfo,
  setBasicInfo,
}: EditBasicInfoStepProps) {
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await CategoryAPI.getAll();
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setBasicInfo((prev) => ({
      ...prev,
      category: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Petition Title</Label>
        <Input
          id="title"
          name="title"
          value={basicInfo.title}
          onChange={handleInputChange}
          placeholder="Enter a clear, descriptive title"
          required
          className="bg-transparent border-gray-700"
        />
        <p className="text-xs text-gray-400">
          A concise title helps others understand your petition at a glance.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={basicInfo.description}
          onChange={handleInputChange}
          placeholder="Describe the issue in detail..."
          required
          className="min-h-32 bg-transparent border-gray-700"
        />
        <p className="text-xs text-gray-400">
          Provide detailed information about the issue, why it matters, and what
          action you're requesting.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select value={basicInfo.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="bg-transparent border-gray-700">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category: CategoryBase) => (
              <SelectItem
                key={category.categoryID}
                value={category.categoryID.toString()}
              >
                {category.categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">
          Choose the category that best fits your petition.
        </p>
      </div>
    </div>
  );
}
