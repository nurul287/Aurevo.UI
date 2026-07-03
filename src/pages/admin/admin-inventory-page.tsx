import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/currency";
import { apiDownloadFile } from "@/lib/api";
// Toast notifications are handled by the mutation hooks
import {
  computeInventoryStats,
  useAllInventoryMovements,
  useDecreaseStock,
  useInventoryLevels,
  useLowStockItems,
  useRestockInventory,
} from "@/services/inventory";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Download,
  Package,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

function unwrapRelation<T>(rel: T | T[] | null | undefined): T | undefined {
  if (rel == null) return undefined;
  return Array.isArray(rel) ? rel[0] : rel;
}

function variantProductName(variant: { products?: unknown } | null): string {
  if (!variant) return "Product";
  const p = unwrapRelation(variant.products as any);
  return (p as { name?: string } | undefined)?.name || "Product";
}

export default function AdminInventoryPage() {
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [movementsPage, setMovementsPage] = useState(1);
  const PAGE_SIZE = 20;
  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const [selectedMovementType, setSelectedMovementType] =
    useState<string>("all");
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [isDecreaseDialogOpen, setIsDecreaseDialogOpen] = useState(false);
  /** True = header "Restock" (pick variant). False = row action (variant fixed). */
  const [restockFromBulk, setRestockFromBulk] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockCost, setRestockCost] = useState("");
  const [restockReference, setRestockReference] = useState("");
  const [restockNotes, setRestockNotes] = useState("");
  const [decreaseQuantity, setDecreaseQuantity] = useState("");
  const [decreaseReason, setDecreaseReason] = useState("");

  // Toast notifications are handled by the mutation hooks

  // Queries
  const { data: inventoryResult, isLoading: inventoryLoading } = useInventoryLevels({
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });
  const inventoryLevels = inventoryResult?.data ?? [];
  const pagination = inventoryResult?.pagination;

  const { data: lowStockResult, isLoading: lowStockLoading } = useLowStockItems({
    page: lowStockPage,
    limit: PAGE_SIZE,
  });
  const lowStockItems = lowStockResult?.data ?? [];
  const lowStockPagination = lowStockResult?.pagination;
  const inventoryStats = computeInventoryStats(inventoryLevels, lowStockPagination?.total ?? 0);

  const { data: movementsResult } = useAllInventoryMovements({
    movement_type:
      selectedMovementType === "all" ? undefined : selectedMovementType,
    search: debouncedSearch,
    page: movementsPage,
    limit: PAGE_SIZE,
  });
  const filteredMovements = movementsResult?.data ?? [];
  const movementsPagination = movementsResult?.pagination;

  // Mutations
  const restockMutation = useRestockInventory();
  const decreaseMutation = useDecreaseStock();

  // Server-side filtered — use data directly
  const filteredInventory = inventoryLevels;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // BE owns the export: it queries the full filtered dataset (no page
      // limit), builds the .xlsx, and names the file — this just tells it
      // which tab and filters are active.
      const q = new URLSearchParams();
      if (activeTab === "inventory") {
        q.set("type", "levels");
        if (debouncedSearch) q.set("search", debouncedSearch);
      } else if (activeTab === "low-stock") {
        q.set("type", "low-stock");
      } else {
        q.set("type", "movements");
        if (selectedMovementType !== "all") q.set("movementType", selectedMovementType);
        if (searchTerm) q.set("search", searchTerm);
      }
      await apiDownloadFile(`/inventory/export?${q.toString()}`);
    } catch (error) {
      showError("Export failed", "Could not generate the export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const resetRestockForm = () => {
    setRestockQuantity("");
    setRestockCost("");
    setRestockReference("");
    setRestockNotes("");
    setSelectedVariant(null);
    setRestockFromBulk(true);
  };

  const openBulkRestock = () => {
    setRestockFromBulk(true);
    setSelectedVariant(null);
    setRestockQuantity("");
    setRestockCost("");
    setRestockReference("");
    setRestockNotes("");
    setIsRestockDialogOpen(true);
  };

  const openSingleRestock = (variant: any) => {
    setRestockFromBulk(false);
    setSelectedVariant(variant);
    setRestockQuantity("");
    setRestockCost("");
    setRestockReference("");
    setRestockNotes("");
    setIsRestockDialogOpen(true);
  };

  const handleRestock = async () => {
    if (!selectedVariant || !restockQuantity) return;

    try {
      await restockMutation.mutateAsync({
        variant_id: selectedVariant.id,
        quantity: parseInt(restockQuantity, 10),
        cost_per_unit: restockCost ? parseFloat(restockCost) : undefined,
        reference_number: restockReference || undefined,
        notes: restockNotes || undefined,
      });

      resetRestockForm();
      setIsRestockDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDecreaseStock = async () => {
    if (!selectedVariant || !decreaseQuantity) return;

    try {
      await decreaseMutation.mutateAsync({
        variant_id: selectedVariant.id,
        quantity: parseInt(decreaseQuantity, 10),
        notes: decreaseReason.trim() || undefined,
      });

      // Reset form
      setDecreaseQuantity("");
      setDecreaseReason("");
      setSelectedVariant(null);
      setIsDecreaseDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getStockStatusBadge = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity <= threshold) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    const variants = {
      restock: { variant: "default" as const, icon: TrendingUp },
      sale: { variant: "secondary" as const, icon: TrendingDown },
      reserve: { variant: "outline" as const, icon: Package },
      unreserve: { variant: "outline" as const, icon: RotateCcw },
      cancel: { variant: "destructive" as const, icon: Trash2 },
      return: { variant: "secondary" as const, icon: RotateCcw },
    };

    const config = variants[type as keyof typeof variants] || {
      variant: "outline" as const,
      icon: Package,
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (inventoryLoading || lowStockLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Loading...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
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
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage product inventory, track stock levels, and monitor movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button size="sm" type="button" onClick={openBulkRestock}>
            <Plus className="h-4 w-4 mr-2" />
            Restock
          </Button>
          <Dialog
            open={isRestockDialogOpen}
            onOpenChange={(open) => {
              setIsRestockDialogOpen(open);
              if (!open) {
                resetRestockForm();
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {restockFromBulk ? "Restock inventory" : "Restock this variant"}
                </DialogTitle>
                <DialogDescription>
                  {restockFromBulk
                    ? "Choose a variant and how many units to add."
                    : "Add units to the variant you selected from the table."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {restockFromBulk ? (
                  <div>
                    <Label htmlFor="variant">Product variant</Label>
                    <Select
                      value={selectedVariant?.id ?? undefined}
                      onValueChange={(value) => {
                        const row = inventoryLevels?.find(
                          (item) => item.product_variants.id === value,
                        );
                        setSelectedVariant(row?.product_variants ?? null);
                      }}
                    >
                      <SelectTrigger id="variant">
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryLevels?.map((item) => (
                          <SelectItem
                            key={item.product_variants.id}
                            value={item.product_variants.id}
                          >
                            {item.product_variants.products.name} —{" "}
                            {item.product_variants.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  selectedVariant && (
                    <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                      <p className="font-medium">
                        {variantProductName(selectedVariant)}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedVariant.name}
                        {selectedVariant.sku
                          ? ` · ${selectedVariant.sku}`
                          : ""}
                      </p>
                    </div>
                  )
                )}
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per Unit (Optional)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={restockCost}
                    onChange={(e) => setRestockCost(e.target.value)}
                    placeholder="Enter cost per unit"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Reference Number (Optional)</Label>
                  <Input
                    id="reference"
                    value={restockReference}
                    onChange={(e) => setRestockReference(e.target.value)}
                    placeholder="PO number, invoice, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRestockDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleRestock()}
                    disabled={
                      restockMutation.isPending ||
                      !selectedVariant ||
                      !restockQuantity
                    }
                  >
                    {restockMutation.isPending ? "Restocking..." : "Restock"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(inventoryStats?.totalStockValue ?? 0, {
                decimals: 0,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Quantity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryStats?.totalStockQuantity.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventoryStats?.lowStockCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Variants
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryStats?.totalVariants || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Levels</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        {/* Inventory Levels Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, variants, or SKUs..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); setMovementsPage(1); }}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setPage(1); setMovementsPage(1); }}>
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels</CardTitle>
              <CardDescription>
                Current stock levels for all product variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product_variants.products.name}
                      </TableCell>
                      <TableCell>{item.product_variants.name}</TableCell>
                      <TableCell>{item.product_variants.sku}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.reserved_quantity}</TableCell>
                      <TableCell>{item.available_quantity}</TableCell>
                      <TableCell>
                        {getStockStatusBadge(
                          item.quantity,
                          item.product_variants.products.low_stock_threshold
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            title="Restock this variant"
                            onClick={() =>
                              openSingleRestock(item.product_variants)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVariant(item.product_variants);
                              setIsDecreaseDialogOpen(true);
                            }}
                          >
                            <TrendingDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total} variants
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm tabular-nums">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Low Stock Tab */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Products that are below their low stock threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Reorder Quantity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product_variants.products.name}
                      </TableCell>
                      <TableCell>{item.product_variants.name}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.product_variants.products.low_stock_threshold}</TableCell>
                      <TableCell>{item.reorder_point}</TableCell>
                      <TableCell>{item.reorder_quantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => openSingleRestock(item.product_variants)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {lowStockPagination && lowStockPagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(lowStockPage - 1) * PAGE_SIZE + 1}–{Math.min(lowStockPage * PAGE_SIZE, lowStockPagination.total)} of {lowStockPagination.total} items
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={lowStockPage <= 1}
                  onClick={() => setLowStockPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm tabular-nums">
                  Page {lowStockPage} of {lowStockPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={lowStockPage >= lowStockPagination.totalPages}
                  onClick={() => setLowStockPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search movements..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setMovementsPage(1); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedMovementType}
              onValueChange={(value) => { setSelectedMovementType(value); setMovementsPage(1); }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="reserve">Reserve</SelectItem>
                <SelectItem value="unreserve">Unreserve</SelectItem>
                <SelectItem value="cancel">Cancel</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || selectedMovementType !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setSelectedMovementType("all"); setMovementsPage(1); setPage(1); }}>
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>
                Recent inventory movements and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.product_variants?.products?.name}
                      </TableCell>
                      <TableCell>{movement.product_variants?.name}</TableCell>
                      <TableCell>
                        {getMovementTypeBadge(movement.movement_type)}
                      </TableCell>
                      <TableCell
                        className={
                          movement.quantity > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </TableCell>
                      <TableCell>{movement.previous_quantity}</TableCell>
                      <TableCell>{movement.new_quantity}</TableCell>
                      <TableCell>{movement.reference_number || "-"}</TableCell>
                      <TableCell>{movement.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {movementsPagination && movementsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(movementsPage - 1) * PAGE_SIZE + 1}–{Math.min(movementsPage * PAGE_SIZE, movementsPagination.total)} of {movementsPagination.total} movements
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={movementsPage <= 1}
                  onClick={() => setMovementsPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm tabular-nums">
                  Page {movementsPage} of {movementsPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={movementsPage >= movementsPagination.totalPages}
                  onClick={() => setMovementsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Decrease Stock Dialog */}
      <Dialog
        open={isDecreaseDialogOpen}
        onOpenChange={(open) => {
          setIsDecreaseDialogOpen(open);
          if (!open) {
            setDecreaseQuantity("");
            setDecreaseReason("");
            setSelectedVariant(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decrease stock</DialogTitle>
            <DialogDescription>
              Remove units from the selected variant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedVariant && (
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                <p className="font-medium">
                  {variantProductName(selectedVariant)}
                </p>
                <p className="text-muted-foreground">
                  {selectedVariant.name}
                  {selectedVariant.sku ? ` · ${selectedVariant.sku}` : ""}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="decrease-quantity">Quantity</Label>
              <Input
                id="decrease-quantity"
                type="number"
                value={decreaseQuantity}
                onChange={(e) => setDecreaseQuantity(e.target.value)}
                placeholder="Enter quantity to decrease"
              />
            </div>
            <div>
              <Label htmlFor="decrease-reason">Reason (Optional)</Label>
              <Textarea
                id="decrease-reason"
                value={decreaseReason}
                onChange={(e) => setDecreaseReason(e.target.value)}
                placeholder="Reason for stock decrease"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDecreaseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleDecreaseStock()}
                disabled={
                  decreaseMutation.isPending ||
                  !selectedVariant ||
                  !decreaseQuantity
                }
                variant="destructive"
              >
                {decreaseMutation.isPending
                  ? "Decreasing..."
                  : "Decrease Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
