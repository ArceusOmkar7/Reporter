/**
 * CategoryManagement Component
 *
 * Admin component for managing system categories:
 * - View all categories
 * - Add new categories
 * - Edit existing categories
 * - Delete categories
 */
import { useState, useEffect } from "react";
import { CategoryAPI } from "@/lib/api-service";
import { CategoryBase } from "@/lib/api-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Edit, Trash, Plus } from "lucide-react";

export function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    categoryID: 0,
    categoryName: "",
    categoryDescription: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const allCategories = await CategoryAPI.getAll();
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      // Create category API call would go here
      // For now, just simulate adding it locally
      const newCategory = {
        categoryID: Math.max(...categories.map((c) => c.categoryID), 0) + 1,
        categoryName: formData.categoryName,
        categoryDescription: formData.categoryDescription,
      };

      setCategories([...categories, newCategory]);
      toast.success("Category added successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    try {
      // Edit category API call would go here
      // For now, just simulate editing it locally
      const updatedCategories = categories.map((category) =>
        category.categoryID === formData.categoryID ? formData : category
      );

      setCategories(updatedCategories);
      toast.success("Category updated successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      // Delete category API call would go here
      // For now, just simulate deleting it locally
      setCategories(categories.filter((c) => c.categoryID !== categoryId));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const openEditDialog = (category: CategoryBase) => {
    setFormData({
      categoryID: category.categoryID,
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription,
    });
    setEditMode(true);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setEditMode(false);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      categoryID: 0,
      categoryName: "",
      categoryDescription: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading categories...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Update the category details below."
                  : "Enter the details for the new category."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryName: e.target.value,
                    })
                  }
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.categoryDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryDescription: e.target.value,
                    })
                  }
                  placeholder="Enter category description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editMode ? handleEditCategory : handleAddCategory}
                disabled={!formData.categoryName.trim()}
              >
                {editMode ? "Save Changes" : "Add Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.categoryID}>
                <TableCell>{category.categoryID}</TableCell>
                <TableCell className="font-medium">
                  {category.categoryName}
                </TableCell>
                <TableCell>{category.categoryDescription}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() =>
                          handleDeleteCategory(category.categoryID)
                        }
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
