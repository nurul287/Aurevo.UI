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
import { CategoryImageField } from "@/components/admin/category-image-field";
import { useToast } from "@/hooks/use-toast";
import { uploadCategoryCoverImage } from "@/lib/upload-category-image";
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
  Image as ImagePlaceholderIcon,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

function CategoryRowThumbnail({ category }: { category: Category }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const url = category.image_url?.trim();

  if (url && !loadFailed) {
    return (
      <img
        src={url}
        alt=""
        className="h-10 w-10 shrink-0 rounded-md border border-border object-cover bg-muted"
        loading="lazy"
        decoding="async"
        onError={() => setLoadFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted"
      title="No category image"
    >
      <ImagePlaceholderIcon
        className="h-5 w-5 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

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
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const { showError } = useToast();

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

  const emptyForm = (): CategoryFormData => ({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    image_url: "",
    sort_order: "0",
    is_active: true,
  });

  const resetFormAndImage = () => {
    setFormData(emptyForm());
    setCategoryImageFile(null);
  };

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
    setCategoryImageFile(null);
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

  const handleSubmitCategory = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      showError("Validation", "Name and slug are required.");
      return;
    }

    const sortOrder = parseInt(formData.sort_order || "0", 10);
    if (Number.isNaN(sortOrder)) {
      showError("Validation", "Sort order must be a number.");
      return;
    }

    setImageUploading(true);
    try {
      if (editingCategory) {
        let imageUrl: string | null = formData.image_url?.trim() || null;
        if (categoryImageFile) {
          try {
            imageUrl = await uploadCategoryCoverImage(
              editingCategory.id,
              categoryImageFile,
            );
          } catch (err) {
            showError(
              "Image upload failed",
              err instanceof Error ? err.message : "Upload failed.",
            );
            return;
          }
        }

        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          parent_id: formData.parent_id || undefined,
          image_url: imageUrl,
          sort_order: sortOrder,
          is_active: formData.is_active,
        });
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        resetFormAndImage();
      } else {
        const created = await createCategoryMutation.mutateAsync({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          parent_id: formData.parent_id || undefined,
          sort_order: sortOrder,
          is_active: formData.is_active,
        });

        if (categoryImageFile && created?.id) {
          try {
            const url = await uploadCategoryCoverImage(
              created.id,
              categoryImageFile,
            );
            await updateCategoryMutation.mutateAsync({
              id: created.id,
              image_url: url,
            });
          } catch (err) {
            showError(
              "Image upload failed",
              err instanceof Error
                ? err.message
                : "Category was created but the image could not be saved. Try editing the category to add an image.",
            );
            setIsAddDialogOpen(false);
            resetFormAndImage();
            return;
          }
        }
        setIsAddDialogOpen(false);
        resetFormAndImage();
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleCategoryImageFileChange = (file: File | null) => {
    setCategoryImageFile(file);
    if (!file) {
      setFormData((prev) => ({ ...prev, image_url: "" }));
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const formBusy =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    imageUploading;

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
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (open) {
                resetFormAndImage();
              } else {
                resetFormAndImage();
              }
            }}
          >
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
                <CategoryImageField
                  existingUrl={formData.image_url || null}
                  file={categoryImageFile}
                  onFileChange={handleCategoryImageFileChange}
                  disabled={formBusy}
                />
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
                  onClick={() => void handleSubmitCategory()}
                  disabled={formBusy}
                >
                  {formBusy ? "Saving..." : "Create Category"}
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
                            <CategoryRowThumbnail
                              key={`${category.id}-${category.image_url ?? ""}`}
                              category={category}
                            />
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
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            resetFormAndImage();
          }
        }}
      >
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
            <CategoryImageField
              existingUrl={formData.image_url || null}
              file={categoryImageFile}
              onFileChange={handleCategoryImageFileChange}
              disabled={formBusy}
            />
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
              onClick={() => void handleSubmitCategory()}
              disabled={formBusy}
            >
              {formBusy ? "Saving..." : "Update Category"}
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
