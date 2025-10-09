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
  useBulkUpdateBrandStatus,
  useCreateBrand,
  useDeleteBrand,
  useUpdateBrand,
} from "@/services/brand";
import { useBrands } from "@/services/product";
import { Brand } from "@/services/types";
import {
  AlertTriangle,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
};

// Form data interfaces
interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
}

export default function AdminBrandsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | "delete"
  >("activate");

  // Form state
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    website_url: "",
    is_active: true,
  });

  // Hooks
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();
  const bulkUpdateStatusMutation = useBulkUpdateBrandStatus();

  // Computed values
  const filteredBrands = useMemo(() => {
    if (!brands) return [];

    return brands.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && brand.is_active) ||
        (statusFilter === "inactive" && !brand.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [brands, searchTerm, statusFilter]);

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

  // Event handlers
  const handleSelectBrand = (brandId: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brandId]);
    } else {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBrands(filteredBrands.map((b) => b.id));
    } else {
      setSelectedBrands([]);
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      logo_url: brand.logo_url || "",
      website_url: brand.website_url || "",
      is_active: brand.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setDeletingBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingBrand) {
      deleteBrandMutation.mutate(deletingBrand.id);
      setIsDeleteDialogOpen(false);
      setDeletingBrand(null);
    }
  };

  const handleBulkAction = () => {
    if (selectedBrands.length === 0) return;

    if (bulkAction === "delete") {
      // For now, we'll just show an error since bulk delete is complex
      alert(
        "Bulk delete not implemented yet. Please delete brands individually."
      );
      return;
    } else {
      bulkUpdateStatusMutation.mutate({
        brandIds: selectedBrands,
        isActive: bulkAction === "activate",
      });
    }

    setSelectedBrands([]);
    setIsBulkActionDialogOpen(false);
  };

  const handleSubmitBrand = () => {
    if (editingBrand) {
      // Update existing brand
      updateBrandMutation.mutate({
        id: editingBrand.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo_url: formData.logo_url || undefined,
        website_url: formData.website_url || undefined,
        is_active: formData.is_active,
      });
      setIsEditDialogOpen(false);
      setEditingBrand(null);
    } else {
      // Create new brand
      createBrandMutation.mutate({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo_url: formData.logo_url || undefined,
        website_url: formData.website_url || undefined,
        is_active: formData.is_active,
      });
      setIsAddDialogOpen(false);
    }

    // Reset form
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo_url: "",
      website_url: "",
      is_active: true,
    });
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingBrand ? prev.slug : generateSlug(name),
    }));
  };

  if (brandsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading brands...</p>
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
            Brands Management
          </h1>
          <p className="text-muted-foreground">
            Manage product brands and manufacturers
          </p>
        </div>
        <div className="flex gap-2">
          {selectedBrands.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(true)}
            >
              Bulk Actions ({selectedBrands.length})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>
                  Create a new product brand.
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
                    placeholder="Brand name"
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
                    placeholder="brand-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="logo_url" className="text-right">
                    Logo URL
                  </Label>
                  <Input
                    id="logo_url"
                    className="col-span-3"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        logo_url: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="website_url" className="text-right">
                    Website URL
                  </Label>
                  <Input
                    id="website_url"
                    className="col-span-3"
                    placeholder="https://brand-website.com"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website_url: e.target.value,
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
                    placeholder="Brand description"
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
                  onClick={handleSubmitBrand}
                  disabled={createBrandMutation.isPending}
                >
                  {createBrandMutation.isPending
                    ? "Creating..."
                    : "Create Brand"}
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
                  placeholder="Search brands..."
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

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Brands ({filteredBrands.length})</CardTitle>
            {selectedBrands.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedBrands.length} selected
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
                        selectedBrands.length === filteredBrands.length &&
                        filteredBrands.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No brands found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.id);
                    return (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectBrand(brand.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              {brand.logo_url ? (
                                <img
                                  src={brand.logo_url}
                                  alt={brand.name}
                                  className="h-8 w-8 rounded object-cover"
                                />
                              ) : (
                                <Tag className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{brand.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {brand.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {brand.website_url ? (
                            <a
                              href={brand.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Visit Website
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No website
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              brand.is_active
                                ? statusColors.active
                                : statusColors.inactive
                            }
                          >
                            {brand.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {brand.created_at
                            ? formatDate(brand.created_at)
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
                                onClick={() => handleEditBrand(brand)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Brand
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteBrand(brand)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Brand
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

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update brand information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                placeholder="Brand name"
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
                placeholder="brand-slug"
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
              onClick={handleSubmitBrand}
              disabled={updateBrandMutation.isPending}
            >
              {updateBrandMutation.isPending ? "Updating..." : "Update Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingBrand?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteBrandMutation.isPending}
            >
              {deleteBrandMutation.isPending ? "Deleting..." : "Delete"}
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
              Choose an action to perform on {selectedBrands.length} selected
              brands.
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
                  <SelectItem value="activate">Activate Brands</SelectItem>
                  <SelectItem value="deactivate">Deactivate Brands</SelectItem>
                  <SelectItem value="delete">Delete Brands</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === "delete" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">
                  This will permanently delete {selectedBrands.length} brands.
                  This action cannot be undone.
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
