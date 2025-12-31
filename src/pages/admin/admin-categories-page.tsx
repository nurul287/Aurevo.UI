import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useBulkUpdateCategoryStatus,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/services/category";
import { useCategories } from "@/services/product";
import { Category } from "@/services/types";
import {
  AlertTriangle,
  Edit,
  Filter,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
};

// Form data interfaces
interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
}

export default function AdminCategoriesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | "delete"
  >("activate");

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    image_url: "",
    sort_order: "0",
    is_active: true,
  });

  // Hooks
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const bulkUpdateStatusMutation = useBulkUpdateCategoryStatus();

  // Computed values
  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.is_active) ||
        (statusFilter === "inactive" && !category.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getParentCategoryName = (parentId?: string) => {
    if (!parentId) return "None";
    const parent = categories?.find((cat) => cat.id === parentId);
    return parent?.name || "Unknown";
  };

  // Event handlers
  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map((c) => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parent_id: category.parent_id || "",
      image_url: category.image_url || "",
      sort_order: category.sort_order?.toString() || "0",
      is_active: category.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteCategoryMutation.mutate(deletingCategory.id);
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  const handleBulkAction = () => {
    if (selectedCategories.length === 0) return;

    if (bulkAction === "delete") {
      // For now, we'll just show an error since bulk delete is complex
      alert(
        "Bulk delete not implemented yet. Please delete categories individually."
      );
      return;
    } else {
      bulkUpdateStatusMutation.mutate({
        categoryIds: selectedCategories,
        isActive: bulkAction === "activate",
      });
    }

    setSelectedCategories([]);
    setIsBulkActionDialogOpen(false);
  };

  const handleSubmitCategory = () => {
    if (editingCategory) {
      // Update existing category
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parent_id: formData.parent_id || undefined,
        image_url: formData.image_url || undefined,
        sort_order: parseInt(formData.sort_order),
        is_active: formData.is_active,
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } else {
      // Create new category
      createCategoryMutation.mutate({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parent_id: formData.parent_id || undefined,
        image_url: formData.image_url || undefined,
        sort_order: parseInt(formData.sort_order),
        is_active: formData.is_active,
      });
      setIsAddDialogOpen(false);
    }

    // Reset form
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent_id: "",
      image_url: "",
      sort_order: "0",
      is_active: true,
    });
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Categories Management
          </h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCategories.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(true)}
            >
              Bulk Actions ({selectedCategories.length})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new product category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    placeholder="Category name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slug" className="text-right">
                    Slug *
                  </Label>
                  <Input
                    id="slug"
                    className="col-span-3"
                    placeholder="category-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent Category
                  </Label>
                  <Select
                    value={formData.parent_id || "none"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, parent_id: value === "none" ? "" : value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Root Category)</SelectItem>
                      {categories
                        ?.filter((cat) => cat.id !== editingCategory?.id)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sort_order" className="text-right">
                    Sort Order
                  </Label>
                  <Input
                    id="sort_order"
                    type="number"
                    className="col-span-3"
                    placeholder="0"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sort_order: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_url" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="image_url"
                    className="col-span-3"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    className="col-span-3"
                    placeholder="Category description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Options</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_active: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSubmitCategory}
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending
                    ? "Creating..."
                    : "Create Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories ({filteredCategories.length})</CardTitle>
            {selectedCategories.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedCategories.length} selected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedCategories.length ===
                          filteredCategories.length &&
                        filteredCategories.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No categories found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectCategory(category.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {category.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getParentCategoryName(category.parent_id)}
                        </TableCell>
                        <TableCell>{category.sort_order || 0}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              category.is_active
                                ? statusColors.active
                                : statusColors.inactive
                            }
                          >
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {category.created_at
                            ? formatDate(category.created_at)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteCategory(category)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Category
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                placeholder="Category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slug" className="text-right">
                Slug *
              </Label>
              <Input
                id="edit-slug"
                className="col-span-3"
                placeholder="category-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmitCategory}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending
                ? "Updating..."
                : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog
        open={isBulkActionDialogOpen}
        onOpenChange={setIsBulkActionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Choose an action to perform on {selectedCategories.length}{" "}
              selected categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={bulkAction}
                onValueChange={(value: "activate" | "deactivate" | "delete") =>
                  setBulkAction(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Categories</SelectItem>
                  <SelectItem value="deactivate">
                    Deactivate Categories
                  </SelectItem>
                  <SelectItem value="delete">Delete Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === "delete" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">
                  This will permanently delete {selectedCategories.length}{" "}
                  categories. This action cannot be undone.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={bulkUpdateStatusMutation.isPending}
            >
              {bulkUpdateStatusMutation.isPending
                ? "Processing..."
                : `Confirm ${bulkAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
