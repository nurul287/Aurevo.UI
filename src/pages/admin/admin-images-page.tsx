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
  useAllImages,
  useBulkDeleteImages,
  useCreateProductImage,
  useDeleteProductImage,
  useProductVariants,
  useUpdateProductImage,
} from "@/services/product";
import { ProductCombobox } from "@/components/admin/product-combobox";
import { Product, ProductImage, ProductVariant } from "@/services/types";
import {
  AlertTriangle,
  CloudUpload,
  Edit,
  Filter,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import BulkImageUploadDialog from "@/components/admin/bulk-image-upload-dialog";

// Form data interfaces
interface ImageFormData {
  product_id: string;
  variant_id: string;
  file: File | null;
  alt_text: string;
  sort_order: string;
  is_primary: boolean;
}

export default function AdminImagesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState<ProductImage | null>(null);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ImageFormData>({
    product_id: "",
    variant_id: "",
    file: null,
    alt_text: "",
    sort_order: "0",
    is_primary: false,
  });

  // Hooks
  const { data: allImages, isLoading: imagesLoading } = useAllImages();

  // Get variants for the selected product
  const { data: productVariants, isLoading: variantsLoading } =
    useProductVariants(formData.product_id);

  const createImageMutation = useCreateProductImage();
  const updateImageMutation = useUpdateProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const bulkDeleteImagesMutation = useBulkDeleteImages();

  // Computed values
  const filteredImages = useMemo(() => {
    if (!allImages) return [];

    return allImages.filter((image) => {
      const matchesSearch =
        image.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.product?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProduct =
        productFilter === "all" || image.product_id === productFilter;

      return matchesSearch && matchesProduct;
    });
  }, [allImages, searchTerm, productFilter]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProductName = (image: ProductImage & { product?: Product }) => {
    return image.product?.name || "Unknown Product";
  };

  const getVariantName = (
    image: ProductImage & { variant?: ProductVariant }
  ) => {
    if (!image.variant) return "No Variant";
    return `${image.variant.name || "Variant"} (${
      image.variant.size || "N/A"
    })`;
  };

  // Handle product selection change
  const handleProductChange = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_id: productId,
      variant_id: "", // Reset variant selection when product changes
    }));
  };

  // Event handlers
  const handleSelectImage = (imageId: string, checked: boolean) => {
    if (checked) {
      setSelectedImages([...selectedImages, imageId]);
    } else {
      setSelectedImages(selectedImages.filter((id) => id !== imageId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(filteredImages.map((img) => img.id));
    } else {
      setSelectedImages([]);
    }
  };

  const handleEditImage = (image: ProductImage) => {
    setEditingImage(image);
    setFormData({
      product_id: image.product_id,
      variant_id: image.variant_id || "",
      file: null,
      alt_text: image.alt_text || "",
      sort_order: image.sort_order?.toString() || "0",
      is_primary: image.is_primary || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteImage = (image: ProductImage) => {
    setDeletingImage(image);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingImage) {
      deleteImageMutation.mutate(deletingImage.id);
      setIsDeleteDialogOpen(false);
      setDeletingImage(null);
    }
  };

  const handleBulkAction = () => {
    if (selectedImages.length === 0) return;

    bulkDeleteImagesMutation.mutate(selectedImages);
    setSelectedImages([]);
    setIsBulkActionDialogOpen(false);
  };

  const handleSubmitImage = () => {
    if (editingImage) {
      // Update existing image
      updateImageMutation.mutate({
        id: editingImage.id,
        alt_text: formData.alt_text,
        sort_order: parseInt(formData.sort_order),
        is_primary: formData.is_primary,
      });
      setIsEditDialogOpen(false);
      setEditingImage(null);
    } else {
      // Create new image
      if (!formData.product_id) {
        alert("Please select a product first.");
        return;
      }

      if (!formData.file) {
        alert("Please select an image file.");
        return;
      }

      createImageMutation.mutate({
        product_id: formData.product_id,
        variant_id: formData.variant_id || undefined,
        file: formData.file,
        alt_text: formData.alt_text,
        sort_order: parseInt(formData.sort_order),
        is_primary: formData.is_primary,
      });
      setIsAddDialogOpen(false);
    }

    // Reset form
    setFormData({
      product_id: "",
      variant_id: "",
      file: null,
      alt_text: "",
      sort_order: "0",
      is_primary: false,
    });
  };

  if (imagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading images...</p>
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
            Product Images Management
          </h1>
          <p className="text-muted-foreground">
            Manage product variant images and galleries
          </p>
        </div>
        <div className="flex gap-2">
          {selectedImages.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(true)}
            >
              Bulk Actions ({selectedImages.length})
            </Button>
          )}
          <Button
            onClick={() => setIsBulkUploadDialogOpen(true)}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Image</DialogTitle>
                <DialogDescription>
                  Add a new image for a specific product variant.
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
                      onChange={(v) => handleProductChange(v === "all" ? "" : v)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="variant_id" className="text-right">
                    Variant *
                  </Label>
                  <Select
                    value={formData.variant_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, variant_id: value }))
                    }
                    disabled={!formData.product_id || variantsLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={
                          !formData.product_id
                            ? "Select a product first"
                            : variantsLoading
                            ? "Loading variants..."
                            : "Select a variant"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {productVariants?.map((variant: any) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name ||
                            `${variant.color || "Unknown"} - ${
                              variant.size || "N/A"
                            }`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_file" className="text-right">
                    Image File *
                  </Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="col-span-3"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alt_text" className="text-right">
                    Alt Text
                  </Label>
                  <Input
                    id="alt_text"
                    className="col-span-3"
                    placeholder="Image description"
                    value={formData.alt_text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        alt_text: e.target.value,
                      }))
                    }
                  />
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
                  <Label className="text-right">Options</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_primary"
                        checked={formData.is_primary}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_primary: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="is_primary">Primary Image</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSubmitImage}
                  disabled={createImageMutation.isPending}
                >
                  {createImageMutation.isPending
                    ? "Creating..."
                    : "Create Image"}
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
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ProductCombobox
              value={productFilter}
              onChange={setProductFilter}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Images ({filteredImages.length})</CardTitle>
            {selectedImages.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedImages.length} selected
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
                        selectedImages.length === filteredImages.length &&
                        filteredImages.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Alt Text</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No images found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredImages.map((image) => {
                    const isSelected = selectedImages.includes(image.id);
                    return (
                      <TableRow key={image.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectImage(image.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-md border overflow-hidden">
                              <img
                                src={image.url}
                                alt={image.alt_text || "Product image"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyMEg0MFY0NEgyNFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDI0SDM2VjQwSDI4VjI0WiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K";
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {image.url}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getProductName(image)}</TableCell>
                        <TableCell>{getVariantName(image)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {image.alt_text || "No alt text"}
                        </TableCell>
                        <TableCell>{image.sort_order || 0}</TableCell>
                        <TableCell>
                          {image.is_primary ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {image.created_at
                            ? formatDate(image.created_at)
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
                                onClick={() => handleEditImage(image)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Image
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteImage(image)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Image
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

      {/* Edit Image Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update image information.</DialogDescription>
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
                    editingImage
                      ? (editingImage as ProductImage & { product?: Product }).product?.name || "Unknown Product"
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-variant" className="text-right">
                Variant
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-variant"
                  value={
                    editingImage && editingImage.variant_id
                      ? allImages?.find((img) => img.id === editingImage.id)
                          ?.variant?.name ||
                        `${
                          allImages?.find((img) => img.id === editingImage.id)
                            ?.variant?.color || "Unknown"
                        } - ${
                          allImages?.find((img) => img.id === editingImage.id)
                            ?.variant?.size || "N/A"
                        }`
                      : "No Variant"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-alt_text" className="text-right">
                Alt Text
              </Label>
              <Input
                id="edit-alt_text"
                className="col-span-3"
                placeholder="Image description"
                value={formData.alt_text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, alt_text: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sort_order" className="text-right">
                Sort Order
              </Label>
              <Input
                id="edit-sort_order"
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
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_primary: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="edit-is_primary">Primary Image</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmitImage}
              disabled={updateImageMutation.isPending}
            >
              {updateImageMutation.isPending ? "Updating..." : "Update Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteImageMutation.isPending}
            >
              {deleteImageMutation.isPending ? "Deleting..." : "Delete"}
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
              Choose an action to perform on {selectedImages.length} selected
              images.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">
                This will permanently delete {selectedImages.length} images.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleBulkAction}
              disabled={bulkDeleteImagesMutation.isPending}
            >
              {bulkDeleteImagesMutation.isPending
                ? "Processing..."
                : "Delete Images"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Image Upload Dialog */}
      <BulkImageUploadDialog
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
        defaultProductId={productFilter !== "all" ? productFilter : undefined}
      />
    </div>
  );
}
