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
  useBrands,
  useBulkDeleteProducts,
  useBulkUpdateProductStatus,
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/services/product";
import {
  CreateProductParams,
  UpdateProductParams,
} from "@/services/product/use-product-mutation";
import { ProductGender, ProductWithVariants } from "@/services/types";
import {
  AlertTriangle,
  Edit,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  draft: "bg-yellow-100 text-yellow-800",
};

// Form data interfaces
interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  category_id: string;
  brand_id: string;
  gender: ProductGender;
  material: string;
  care_instructions: string;
  weight: string;
  base_price: string;
  compare_at_price: string;
  cost_price: string;
  is_featured: boolean;
  requires_shipping: boolean;
  track_inventory: boolean;
  allow_backorder: boolean;
  min_order_quantity: string;
  max_order_quantity: string;
  meta_title: string;
  meta_description: string;
  tags: string;
  is_active: boolean;
}

export default function AdminProductsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithVariants | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithVariants | null>(null);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | "delete"
  >("activate");

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    sku: "",
    category_id: "",
    brand_id: "",
    gender: "unisex",
    material: "",
    care_instructions: "",
    weight: "",
    base_price: "",
    compare_at_price: "",
    cost_price: "",
    is_featured: false,
    requires_shipping: true,
    track_inventory: true,
    allow_backorder: false,
    min_order_quantity: "1",
    max_order_quantity: "",
    meta_title: "",
    meta_description: "",
    tags: "",
    is_active: true,
  });

  // Hooks
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
  });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkUpdateStatusMutation = useBulkUpdateProductStatus();
  const bulkDeleteProductsMutation = useBulkDeleteProducts();

  // Computed values
  const products = productsData?.data || [];
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active) ||
        (statusFilter === "inactive-brand" &&
          product.brand &&
          !product.brand.is_active);

      const matchesCategory =
        categoryFilter === "all" || product.category_id === categoryFilter;

      const matchesBrand =
        brandFilter === "all" || product.brand_id === brandFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, statusFilter, categoryFilter, brandFilter]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStockStatus = (product: ProductWithVariants) => {
    if (!product.variants || product.variants.length === 0) {
      return { label: "No Variants", color: "bg-gray-100 text-gray-800" };
    }

    const totalStock = product.variants.reduce((sum) => {
      // This would need to be calculated from inventory table
      return sum + 0; // Placeholder
    }, 0);

    if (totalStock === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (totalStock < 10)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Event handlers
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleEditProduct = (product: ProductWithVariants) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      short_description: product.short_description || "",
      sku: product.sku || "",
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      gender: product.gender || "unisex",
      material: product.material || "",
      care_instructions: product.care_instructions || "",
      weight: product.weight?.toString() || "",
      base_price: product.base_price.toString(),
      compare_at_price: product.compare_at_price?.toString() || "",
      cost_price: product.cost_price?.toString() || "",
      is_featured: product.is_featured || false,
      requires_shipping: product.requires_shipping ?? true,
      track_inventory: product.track_inventory ?? true,
      allow_backorder: product.allow_backorder || false,
      min_order_quantity: product.min_order_quantity?.toString() || "1",
      max_order_quantity: product.max_order_quantity?.toString() || "",
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      tags: product.tags?.join(", ") || "",
      is_active: product.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: ProductWithVariants) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProductMutation.mutate(deletingProduct.id);
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
    }
  };

  const handleBulkAction = () => {
    if (selectedProducts.length === 0) return;

    if (bulkAction === "delete") {
      bulkDeleteProductsMutation.mutate(selectedProducts);
    } else {
      bulkUpdateStatusMutation.mutate({
        productIds: selectedProducts,
        isActive: bulkAction === "activate",
      });
    }

    setSelectedProducts([]);
    setIsBulkActionDialogOpen(false);
  };

  const handleSubmitProduct = () => {
    if (editingProduct) {
      // Update existing product
      const updateData: UpdateProductParams = {
        id: editingProduct.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        sku: formData.sku,
        category_id: formData.category_id || undefined,
        brand_id: formData.brand_id || undefined,
        gender: formData.gender,
        material: formData.material,
        care_instructions: formData.care_instructions,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        base_price: parseFloat(formData.base_price),
        compare_at_price: formData.compare_at_price
          ? parseFloat(formData.compare_at_price)
          : undefined,
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : undefined,
        is_featured: formData.is_featured,
        requires_shipping: formData.requires_shipping,
        track_inventory: formData.track_inventory,
        allow_backorder: formData.allow_backorder,
        min_order_quantity: formData.min_order_quantity
          ? parseInt(formData.min_order_quantity)
          : undefined,
        max_order_quantity: formData.max_order_quantity
          ? parseInt(formData.max_order_quantity)
          : undefined,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
      };

      updateProductMutation.mutate(updateData);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } else {
      // Create new product
      const createData: CreateProductParams = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        sku: formData.sku,
        category_id: formData.category_id || undefined,
        brand_id: formData.brand_id || undefined,
        gender: formData.gender,
        material: formData.material,
        care_instructions: formData.care_instructions,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        base_price: parseFloat(formData.base_price),
        compare_at_price: formData.compare_at_price
          ? parseFloat(formData.compare_at_price)
          : undefined,
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : undefined,
        is_featured: formData.is_featured,
        requires_shipping: formData.requires_shipping,
        track_inventory: formData.track_inventory,
        allow_backorder: formData.allow_backorder,
        min_order_quantity: formData.min_order_quantity
          ? parseInt(formData.min_order_quantity)
          : undefined,
        max_order_quantity: formData.max_order_quantity
          ? parseInt(formData.max_order_quantity)
          : undefined,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
      };

      createProductMutation.mutate(createData);
      setIsAddDialogOpen(false);
    }

    // Reset form
    setFormData({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      sku: "",
      category_id: "",
      brand_id: "",
      gender: "unisex",
      material: "",
      care_instructions: "",
      weight: "",
      base_price: "",
      compare_at_price: "",
      cost_price: "",
      is_featured: false,
      requires_shipping: true,
      track_inventory: true,
      allow_backorder: false,
      min_order_quantity: "1",
      max_order_quantity: "",
      meta_title: "",
      meta_description: "",
      tags: "",
      is_active: true,
    });
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
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
            Products Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product inventory and catalog
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(true)}
            >
              Bulk Actions ({selectedProducts.length})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product in your inventory.
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
                    placeholder="Product name"
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
                    placeholder="product-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    className="col-span-3"
                    placeholder="Product SKU"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sku: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category_id: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">
                    Brand
                  </Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, brand_id: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: ProductGender) =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="base_price" className="text-right">
                    Base Price *
                  </Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    placeholder="0.00"
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        base_price: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="compare_at_price" className="text-right">
                    Compare Price
                  </Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    placeholder="0.00"
                    value={formData.compare_at_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        compare_at_price: e.target.value,
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
                    placeholder="Product description"
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
                  <Label htmlFor="short_description" className="text-right">
                    Short Description
                  </Label>
                  <Input
                    id="short_description"
                    className="col-span-3"
                    placeholder="Brief product description"
                    value={formData.short_description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        short_description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="material" className="text-right">
                    Material
                  </Label>
                  <Input
                    id="material"
                    className="col-span-3"
                    placeholder="Product material"
                    value={formData.material}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        material: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    className="col-span-3"
                    placeholder="tag1, tag2, tag3"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tags: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Options</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_featured: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="is_featured">Featured Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requires_shipping"
                        checked={formData.requires_shipping}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            requires_shipping: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="requires_shipping">
                        Requires Shipping
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="track_inventory"
                        checked={formData.track_inventory}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            track_inventory: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="track_inventory">Track Inventory</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSubmitProduct}
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending
                    ? "Creating..."
                    : "Create Product"}
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
                  placeholder="Search products, brands, or SKUs..."
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
                <SelectItem value="inactive-brand">Inactive Brand</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            {selectedProducts.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedProducts.length} selected
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
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No products found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isSelected = selectedProducts.includes(product.id);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectProduct(product.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {product.sku || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.brand?.name || "N/A"}
                        </TableCell>
                        <TableCell>{product.category?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatCurrency(product.base_price)}
                            </div>
                            {product.compare_at_price && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.compare_at_price)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {product.variants?.length || 0} variants
                            </div>
                            <Badge className={stockStatus.color}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={
                                product.is_active
                                  ? statusColors.active
                                  : statusColors.inactive
                              }
                            >
                              Product:{" "}
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {product.brand && (
                              <Badge
                                className={
                                  product.brand.is_active
                                    ? statusColors.active
                                    : statusColors.inactive
                                }
                              >
                                Brand:{" "}
                                {product.brand.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.created_at
                            ? formatDate(product.created_at)
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
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Product
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                placeholder="Product name"
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
                placeholder="product-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-base_price" className="text-right">
                Base Price *
              </Label>
              <Input
                id="edit-base_price"
                type="number"
                step="0.01"
                className="col-span-3"
                placeholder="0.00"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    base_price: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_featured: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="edit-is_featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_active: !!checked }))
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
              onClick={handleSubmitProduct}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending
                ? "Updating..."
                : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
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
              Choose an action to perform on {selectedProducts.length} selected
              products.
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
                  <SelectItem value="activate">Activate Products</SelectItem>
                  <SelectItem value="deactivate">
                    Deactivate Products
                  </SelectItem>
                  <SelectItem value="delete">Delete Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === "delete" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">
                  This will permanently delete {selectedProducts.length}{" "}
                  products. This action cannot be undone.
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
                bulkDeleteProductsMutation.isPending
              }
            >
              {bulkUpdateStatusMutation.isPending ||
              bulkDeleteProductsMutation.isPending
                ? "Processing..."
                : `Confirm ${bulkAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
