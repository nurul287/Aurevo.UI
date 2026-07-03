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
import {
  useAdminVariants,
  useBulkDeleteVariants,
  useBulkUpdateVariantStatus,
  useCreateProductVariant,
  useDeleteProductVariant,
  useUpdateProductVariant,
} from "@/services/product";
import { Product, ProductVariant } from "@/services/types";
import {
  AlertTriangle,
  Edit,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useState } from "react";
import GenerateVariantsDialog from "@/components/admin/generate-variants-dialog";
import { ProductCombobox } from "@/components/admin/product-combobox";
import { formatPrice } from "@/lib/currency";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
};

// Form data interfaces
interface VariantFormData {
  product_id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  color_code: string;
  material: string;
  weight: string;
  price: string;
  compare_at_price: string;
  barcode: string;
  sort_order: string;
  is_active: boolean;
  stock: string;
}

export default function AdminVariantsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">("all");
  const [productFilter, setProductFilter] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const hasActiveFilters = !!searchTerm || statusFilter !== "all" || productFilter !== "all";
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(
    null
  );
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | "delete"
  >("activate");

  // Form state
  const [formData, setFormData] = useState<VariantFormData>({
    product_id: "",
    sku: "",
    name: "",
    size: "",
    color: "",
    color_code: "",
    material: "",
    weight: "",
    price: "",
    compare_at_price: "",
    barcode: "",
    sort_order: "0",
    is_active: true,
    stock: "",
  });

  // Hooks
  const { data: variantsData, isLoading: variantsLoading, isFetching: variantsFetching } = useAdminVariants({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    isActive: statusFilter !== "all" ? statusFilter as "true" | "false" : undefined,
    productId: productFilter !== "all" ? productFilter : undefined,
  });

  const variants = variantsData?.data ?? [];
  const totalPages = variantsData?.totalPages ?? 1;
  const totalCount = variantsData?.count ?? 0;

  const createVariantMutation = useCreateProductVariant();
  const updateVariantMutation = useUpdateProductVariant();
  const deleteVariantMutation = useDeleteProductVariant();
  const bulkUpdateStatusMutation = useBulkUpdateVariantStatus();
  const bulkDeleteVariantsMutation = useBulkDeleteVariants();

  // Stock must be an explicit non-negative integer — same rule as Generate Variants.
  const createStockTrimmed = formData.stock.trim();
  const isCreateStockValid =
    createStockTrimmed.length > 0 &&
    /^\d+$/.test(createStockTrimmed) &&
    parseInt(createStockTrimmed, 10) >= 0;

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProductFilter("all");
    setPage(1);
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProductName = (variant: ProductVariant & { product?: Product }) => {
    return variant.product?.name || "Unknown Product";
  };

  // Event handlers
  const handleSelectVariant = (variantId: string, checked: boolean) => {
    if (checked) {
      setSelectedVariants([...selectedVariants, variantId]);
    } else {
      setSelectedVariants(selectedVariants.filter((id) => id !== variantId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVariants(variants.map((v) => v.id));
    } else {
      setSelectedVariants([]);
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      product_id: variant.product_id,
      sku: variant.sku || "",
      name: variant.name || "",
      size: variant.size || "",
      color: variant.color || "",
      color_code: variant.color_code || "",
      material: variant.material || "",
      weight: variant.weight?.toString() || "",
      price: variant.price?.toString() || "",
      compare_at_price: variant.compare_at_price?.toString() || "",
      barcode: variant.barcode || "",
      sort_order: variant.sort_order?.toString() || "0",
      is_active: variant.is_active ?? true,
      stock: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    setDeletingVariant(variant);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingVariant) {
      deleteVariantMutation.mutate({ variantId: deletingVariant.id, productId: deletingVariant.product_id }, { onSuccess: () => setPage(1) });
      setIsDeleteDialogOpen(false);
      setDeletingVariant(null);
    }
  };

  const handleBulkAction = () => {
    if (selectedVariants.length === 0) return;

    if (bulkAction === "delete") {
      bulkDeleteVariantsMutation.mutate(selectedVariants, { onSuccess: () => setPage(1) });
    } else {
      bulkUpdateStatusMutation.mutate({
        variantIds: selectedVariants,
        isActive: bulkAction === "activate",
      }, { onSuccess: () => setPage(1) });
    }

    setSelectedVariants([]);
    setIsBulkActionDialogOpen(false);
  };

  const handleSubmitVariant = () => {
    if (editingVariant) {
      // Update existing variant
      updateVariantMutation.mutate({
        id: editingVariant.id,
        sku: formData.sku,
        name: formData.name,
        size: formData.size,
        color: formData.color,
        color_code: formData.color_code,
        material: formData.material,
        weight: parseFloat(formData.weight) || undefined,
        price: parseFloat(formData.price) || undefined,
        compare_at_price: parseFloat(formData.compare_at_price) || undefined,
        barcode: formData.barcode,
        sort_order: parseInt(formData.sort_order),
        is_active: formData.is_active,
      }, { onSuccess: () => setPage(1) });
      setIsEditDialogOpen(false);
      setEditingVariant(null);
    } else {
      // Create new variant
      if (!formData.product_id) {
        alert("Please select a product first.");
        return;
      }
      if (!formData.size.trim()) {
        alert("Please enter a size.");
        return;
      }
      if (!isCreateStockValid) {
        alert("Please enter a valid initial stock (0 or greater).");
        return;
      }

      // Mirrors the Generate Variants dialog: name is derived as "Color / Size".
      const derivedName =
        [formData.color.trim(), formData.size.trim()].filter(Boolean).join(" / ");

      createVariantMutation.mutate({
        product_id: formData.product_id,
        sku: formData.sku,
        name: derivedName,
        size: formData.size,
        color: formData.color,
        color_code: formData.color_code,
        material: formData.material,
        weight: parseFloat(formData.weight) || undefined,
        price: parseFloat(formData.price) || undefined,
        compare_at_price: parseFloat(formData.compare_at_price) || undefined,
        barcode: formData.barcode,
        sort_order: parseInt(formData.sort_order),
        is_active: formData.is_active,
        stock: parseInt(formData.stock, 10),
      }, { onSuccess: () => setPage(1) });
      setIsAddDialogOpen(false);
    }

    // Reset form
    setFormData({
      product_id: "",
      sku: "",
      name: "",
      size: "",
      color: "",
      color_code: "",
      material: "",
      weight: "",
      price: "",
      compare_at_price: "",
      barcode: "",
      sort_order: "0",
      is_active: true,
      stock: "",
    });
  };

  if (variantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading variants...</p>
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
            Product Variants Management
          </h1>
          <p className="text-muted-foreground">
            Manage product variants (sizes, colors, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          {selectedVariants.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(true)}
            >
              Bulk Actions ({selectedVariants.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setIsGenerateDialogOpen(true)}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Variants
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Variant</DialogTitle>
                <DialogDescription>
                  Create a new product variant.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product_id" className="text-right">
                    Product *
                  </Label>
                  <div className="col-span-3">
                    <ProductCombobox
                      value={formData.product_id || "all"}
                      onChange={(v) => setFormData((prev) => ({ ...prev, product_id: v === "all" ? "" : v }))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    className="col-span-3"
                    placeholder="Variant SKU"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sku: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="size" className="text-right">
                    Size <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="size"
                    className="col-span-3"
                    placeholder="Size (e.g., 10, M, L)"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, size: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Color
                  </Label>
                  <Input
                    id="color"
                    className="col-span-3"
                    placeholder="Color name"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color_code" className="text-right">
                    Color Code
                  </Label>
                  <div className="col-span-3 flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1 bg-white">
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(formData.color_code) ? formData.color_code : "#000000"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color_code: e.target.value,
                        }))
                      }
                      className="w-7 h-7 cursor-pointer border-0 bg-transparent p-0"
                      aria-label="Color code"
                    />
                    <Input
                      id="color_code"
                      placeholder="#FF0000"
                      value={formData.color_code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color_code: e.target.value,
                        }))
                      }
                      className="border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="price" className="text-right pt-2">
                    Price
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="Leave empty to use product base price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Optional. Only set this if this size/color costs more or
                      less than the product&apos;s base price.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="stock" className="text-right pt-2">
                    Initial Stock <span className="text-red-500">*</span>
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="stock"
                      type="number"
                      min={0}
                      step={1}
                      placeholder="e.g. 10"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                      aria-invalid={createStockTrimmed.length > 0 && !isCreateStockValid}
                      className={
                        createStockTrimmed.length > 0 && !isCreateStockValid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : undefined
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Required. Enter <code className="bg-gray-100 px-1 rounded">0</code>{" "}
                      if you&apos;ll add real stock later.
                    </p>
                  </div>
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
                  onClick={handleSubmitVariant}
                  disabled={
                    createVariantMutation.isPending ||
                    !formData.product_id ||
                    !formData.size.trim() ||
                    !isCreateStockValid
                  }
                >
                  {createVariantMutation.isPending
                    ? "Creating..."
                    : "Create Variant"}
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
                  placeholder="Search variants..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as "all" | "true" | "false"); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <ProductCombobox value={productFilter} onChange={(v) => { setProductFilter(v); setPage(1); }} />
            {hasActiveFilters && (
              <Button variant="ghost" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variants ({totalCount})</CardTitle>
            {selectedVariants.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedVariants.length} selected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-md border">
            {variantsFetching && !variantsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 rounded-md">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        variants.length > 0 &&
                        variants.every((v) => selectedVariants.includes(v.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No variants found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  variants.map((variant) => {
                    const isSelected = selectedVariants.includes(variant.id);
                    return (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectVariant(variant.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {variant.name || "Unnamed Variant"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {variant.sku || "No SKU"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getProductName(variant)}</TableCell>
                        <TableCell>{variant.size || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {variant.color_code && (
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: variant.color_code }}
                              />
                            )}
                            <span>{variant.color || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {variant.price ? (
                            <span>{formatPrice(variant.price)}</span>
                          ) : (variant as ProductVariant & { product?: Product })
                              .product?.base_price ? (
                            <span className="text-gray-500">
                              {formatPrice(
                                (
                                  variant as ProductVariant & {
                                    product?: Product;
                                  }
                                ).product!.base_price,
                              )}
                              <span className="ml-1 text-xs text-gray-400">
                                (base)
                              </span>
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              variant.is_active
                                ? statusColors.active
                                : statusColors.inactive
                            }
                          >
                            {variant.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {variant.created_at
                            ? formatDate(variant.created_at)
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
                                onClick={() => handleEditVariant(variant)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Variant
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteVariant(variant)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Variant
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Variant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
            <DialogDescription>Update variant information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product" className="text-right">
                Product
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-product"
                  value={
                    editingVariant
                      ? (editingVariant as ProductVariant & { product?: Product }).product?.name || "Unknown Product"
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sku" className="text-right">
                SKU
              </Label>
              <Input
                id="edit-sku"
                className="col-span-3"
                placeholder="Variant SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sku: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                placeholder="Variant name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-size" className="text-right">
                Size
              </Label>
              <Input
                id="edit-size"
                className="col-span-3"
                placeholder="Size (e.g., 10, M, L)"
                value={formData.size}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, size: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                Color
              </Label>
              <Input
                id="edit-color"
                className="col-span-3"
                placeholder="Color name"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-price" className="text-right pt-2">
                Price
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="Leave empty to use product base price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
                <p className="text-xs text-gray-500">
                  Optional. Only set this if this size/color costs more or less
                  than the product&apos;s base price.
                </p>
              </div>
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
              onClick={handleSubmitVariant}
              disabled={updateVariantMutation.isPending}
            >
              {updateVariantMutation.isPending
                ? "Updating..."
                : "Update Variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this variant? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteVariantMutation.isPending}
            >
              {deleteVariantMutation.isPending ? "Deleting..." : "Delete"}
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
              Choose an action to perform on {selectedVariants.length} selected
              variants.
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
                  <SelectItem value="activate">Activate Variants</SelectItem>
                  <SelectItem value="deactivate">
                    Deactivate Variants
                  </SelectItem>
                  <SelectItem value="delete">Delete Variants</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === "delete" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">
                  This will permanently delete {selectedVariants.length}{" "}
                  variants. This action cannot be undone.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={
                bulkUpdateStatusMutation.isPending ||
                bulkDeleteVariantsMutation.isPending
              }
            >
              {bulkUpdateStatusMutation.isPending ||
              bulkDeleteVariantsMutation.isPending
                ? "Processing..."
                : `Confirm ${bulkAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Variants Dialog */}
      <GenerateVariantsDialog
        open={isGenerateDialogOpen}
        onOpenChange={(open) => { setIsGenerateDialogOpen(open); if (!open) setPage(1); }}
        defaultProductId={productFilter !== "all" ? productFilter : undefined}
      />
    </div>
  );
}
