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
  useAdminImages,
  useBulkDeleteImages,
  useCreateProductImage,
  useDeleteProductImage,
  useProductVariants,
  useUpdateProductImage,
} from "@/services/product";
import { ProductCombobox } from "@/components/admin/product-combobox";
import type { AdminImageRow } from "@/services/product/use-product-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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
  X,
} from "lucide-react";
import { useState } from "react";
import BulkImageUploadDialog from "@/components/admin/bulk-image-upload-dialog";

interface ImageFormData {
  product_id: string;
  variant_id: string;
  file: File | null;
  alt_text: string;
  sort_order: string;
  is_primary: boolean;
}

const EMPTY_FORM: ImageFormData = {
  product_id: "",
  variant_id: "",
  file: null,
  alt_text: "",
  sort_order: "0",
  is_primary: false,
};

export default function AdminImagesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<AdminImageRow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState<AdminImageRow | null>(null);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);

  const [formData, setFormData] = useState<ImageFormData>(EMPTY_FORM);

  const { data: imagesResult, isLoading: imagesLoading } = useAdminImages({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    productId: productFilter !== "all" ? productFilter : undefined,
  });

  const images = imagesResult?.data ?? [];
  const pagination = imagesResult?.pagination;

  const { data: productVariants, isLoading: variantsLoading } =
    useProductVariants(formData.product_id);

  const createImageMutation = useCreateProductImage();
  const updateImageMutation = useUpdateProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const bulkDeleteImagesMutation = useBulkDeleteImages();

  const hasFilters = !!debouncedSearch || productFilter !== "all";

  const handleClearFilters = () => {
    setSearchInput("");
    setProductFilter("all");
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleProductFilterChange = (value: string) => {
    setProductFilter(value);
    setPage(1);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleProductChange = (productId: string) => {
    setFormData((prev) => ({ ...prev, product_id: productId, variant_id: "" }));
  };

  const handleSelectImage = (imageId: string, checked: boolean) => {
    setSelectedImages((prev) =>
      checked ? [...prev, imageId] : prev.filter((id) => id !== imageId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedImages(checked ? images.map((img) => img.id) : []);
  };

  const handleEditImage = (image: AdminImageRow) => {
    setEditingImage(image);
    setFormData({
      product_id: image.product_id,
      variant_id: image.variant_id || "",
      file: null,
      alt_text: image.alt_text || "",
      sort_order: image.sort_order?.toString() ?? "0",
      is_primary: image.is_primary || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteImage = (image: AdminImageRow) => {
    setDeletingImage(image);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingImage) return;
    deleteImageMutation.mutate({ imageId: deletingImage.id, productId: deletingImage.product_id }, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDeletingImage(null);
      },
    });
  };

  const handleBulkAction = () => {
    if (!selectedImages.length) return;
    const deleteItems = selectedImages
      .map((id) => {
        const img = images.find((i) => i.id === id);
        return img ? { imageId: id, productId: img.product_id } : null;
      })
      .filter(Boolean) as { imageId: string; productId: string }[];
    bulkDeleteImagesMutation.mutate(deleteItems, {
      onSuccess: () => {
        setSelectedImages([]);
        setIsBulkActionDialogOpen(false);
      },
    });
  };

  const handleSubmitImage = () => {
    if (editingImage) {
      updateImageMutation.mutate(
        {
          id: editingImage.id,
          product_id: editingImage.product_id,
          alt_text: formData.alt_text,
          sort_order: parseInt(formData.sort_order),
          is_primary: formData.is_primary,
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setEditingImage(null);
            setFormData(EMPTY_FORM);
          },
        }
      );
    } else {
      if (!formData.product_id) { alert("Please select a product first."); return; }
      if (!formData.file) { alert("Please select an image file."); return; }

      createImageMutation.mutate(
        {
          product_id: formData.product_id,
          variant_id: formData.variant_id || undefined,
          file: formData.file,
          alt_text: formData.alt_text,
          sort_order: parseInt(formData.sort_order),
          is_primary: formData.is_primary,
        },
        {
          onSuccess: () => {
            setIsAddDialogOpen(false);
            setFormData(EMPTY_FORM);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Images Management</h1>
          <p className="text-muted-foreground">Manage product variant images and galleries</p>
        </div>
        <div className="flex gap-2">
          {selectedImages.length > 0 && (
            <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(true)}>
              Bulk Actions ({selectedImages.length})
            </Button>
          )}
          <Button onClick={() => setIsBulkUploadDialogOpen(true)}>
            <CloudUpload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setFormData(EMPTY_FORM); }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Image</DialogTitle>
                <DialogDescription>Upload a new image for a product or variant.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Product *</Label>
                  <div className="col-span-3">
                    <ProductCombobox
                      value={formData.product_id || "all"}
                      onChange={(v) => handleProductChange(v === "all" ? "" : v)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Variant</Label>
                  <Select
                    value={formData.variant_id}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, variant_id: v }))}
                    disabled={!formData.product_id || variantsLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={
                          !formData.product_id ? "Select a product first"
                            : variantsLoading ? "Loading variants..."
                            : "Select a variant (optional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {productVariants?.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name || `${v.color || "Unknown"} - ${v.size || "N/A"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_file" className="text-right">Image File *</Label>
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
                  <Label htmlFor="alt_text" className="text-right">Alt Text</Label>
                  <Input
                    id="alt_text"
                    className="col-span-3"
                    placeholder="Image description"
                    value={formData.alt_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, alt_text: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sort_order" className="text-right">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    className="col-span-3"
                    placeholder="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Options</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="is_primary"
                      checked={formData.is_primary}
                      onCheckedChange={(c) => setFormData((prev) => ({ ...prev, is_primary: !!c }))}
                    />
                    <Label htmlFor="is_primary">Primary Image</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitImage} disabled={createImageMutation.isPending}>
                  {createImageMutation.isPending ? "Uploading..." : "Upload"}
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name, alt text or URL..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ProductCombobox value={productFilter} onChange={handleProductFilterChange} />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Images ({pagination?.total ?? 0})
            </CardTitle>
            {selectedImages.length > 0 && (
              <div className="text-sm text-muted-foreground">{selectedImages.length} selected</div>
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
                      checked={images.length > 0 && selectedImages.length === images.length}
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
                {imagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        <p className="text-muted-foreground text-sm">Loading images...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : images.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No images found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  images.map((image) => {
                    const variantLabel = image.variant_name
                      || (image.variant_color || image.variant_size
                          ? [image.variant_color, image.variant_size].filter(Boolean).join(" / ")
                          : null);
                    return (
                      <TableRow key={image.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedImages.includes(image.id)}
                            onCheckedChange={(c) => handleSelectImage(image.id, !!c)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-md border overflow-hidden shrink-0">
                              <img
                                src={image.url}
                                alt={image.alt_text || "Product image"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyMEg0MFY0NEgyNFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDI0SDM2VjQwSDI4VjI0WiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K";
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {image.url}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{image.product_name || "—"}</TableCell>
                        <TableCell className="text-sm">{variantLabel || "No variant"}</TableCell>
                        <TableCell className="max-w-[180px] truncate text-sm">
                          {image.alt_text || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">{image.sort_order ?? 0}</TableCell>
                        <TableCell>
                          {image.is_primary ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {image.created_at ? formatDate(image.created_at) : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditImage(image)}>
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} images
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Image Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingImage(null); setFormData(EMPTY_FORM); } }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update image metadata.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Product</Label>
              <Input
                className="col-span-3 bg-muted"
                value={editingImage?.product_name || "Unknown"}
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Variant</Label>
              <Input
                className="col-span-3 bg-muted"
                value={
                  editingImage?.variant_id
                    ? editingImage.variant_name
                      || [editingImage.variant_color, editingImage.variant_size].filter(Boolean).join(" / ")
                      || "Variant"
                    : "No variant"
                }
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-alt_text" className="text-right">Alt Text</Label>
              <Input
                id="edit-alt_text"
                className="col-span-3"
                placeholder="Image description"
                value={formData.alt_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, alt_text: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sort_order" className="text-right">Sort Order</Label>
              <Input
                id="edit-sort_order"
                type="number"
                className="col-span-3"
                placeholder="0"
                value={formData.sort_order}
                onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="edit-is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, is_primary: !!c }))}
                />
                <Label htmlFor="edit-is_primary">Primary Image</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitImage} disabled={updateImageMutation.isPending}>
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
              Are you sure you want to delete this image? This action cannot be undone.
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
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Choose an action to perform on {selectedImages.length} selected images.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <p className="text-sm text-red-600">
              This will permanently delete {selectedImages.length} images. This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleBulkAction}
              disabled={bulkDeleteImagesMutation.isPending}
            >
              {bulkDeleteImagesMutation.isPending ? "Processing..." : "Delete Images"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <BulkImageUploadDialog
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
        defaultProductId={productFilter !== "all" ? productFilter : undefined}
      />
    </div>
  );
}
