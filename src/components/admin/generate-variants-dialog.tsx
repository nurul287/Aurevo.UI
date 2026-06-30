import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useBulkCreateVariants, useProduct } from "@/services/product";
import { ProductCombobox } from "@/components/admin/product-combobox";
import { Plus, Trash2, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const EU_SHOE_SIZES = Array.from({ length: 13 }, (_, i) => String(36 + i)); // 36..48
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface ColorRow {
  id: string;
  name: string;
  code: string;
}

interface GenerateVariantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProductId?: string;
}

const slugifyForSku = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);

const newColorId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const GenerateVariantsDialog = ({
  open,
  onOpenChange,
  defaultProductId,
}: GenerateVariantsDialogProps) => {
  const [productId, setProductId] = useState<string>(defaultProductId ?? "");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<ColorRow[]>([
    { id: newColorId(), name: "", code: "#000000" },
  ]);
  const [skuPrefix, setSkuPrefix] = useState("");
  const [initialStock, setInitialStock] = useState<string>("");

  const bulkCreate = useBulkCreateVariants();

  useEffect(() => {
    if (open) {
      setProductId(defaultProductId ?? "");
      setSizes([]);
      setSizeInput("");
      setColors([{ id: newColorId(), name: "", code: "#000000" }]);
      setSkuPrefix("");
      setInitialStock("");
    }
  }, [open, defaultProductId]);

  const { data: selectedProduct } = useProduct(productId);

  const validColors = colors.filter((c) => c.name.trim().length > 0);

  // Stock must be an explicit non-negative integer.
  const stockTrimmed = initialStock.trim();
  const isStockValid =
    stockTrimmed.length > 0 &&
    /^\d+$/.test(stockTrimmed) &&
    parseInt(stockTrimmed, 10) >= 0;
  const stock = isStockValid ? parseInt(stockTrimmed, 10) : 0;

  const previewRows = useMemo(() => {
    if (!validColors.length || !sizes.length) return [];
    const rows: Array<{
      sku: string;
      name: string;
      size: string;
      color: string;
      colorCode: string;
      stock: number;
    }> = [];

    validColors.forEach((color) => {
      sizes.forEach((size) => {
        const colorPart = slugifyForSku(color.name);
        const sizePart = slugifyForSku(size);
        const sku = skuPrefix.trim()
          ? `${skuPrefix.trim().toUpperCase()}-${colorPart}-${sizePart}`
          : "";
        rows.push({
          sku,
          name: `${color.name.trim()} / ${size}`,
          size,
          color: color.name.trim(),
          colorCode: color.code,
          stock,
        });
      });
    });

    return rows;
  }, [validColors, sizes, skuPrefix, stock]);

  // Toggle a size on/off. Used by the grid buttons.
  const handleToggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size],
    );
  };

  const handleSelectGroup = (groupSizes: string[]) => {
    const allSelected = groupSizes.every((s) => sizes.includes(s));
    if (allSelected) {
      setSizes((prev) => prev.filter((s) => !groupSizes.includes(s)));
    } else {
      setSizes((prev) => Array.from(new Set([...prev, ...groupSizes])));
    }
  };

  const handleClearSizes = () => setSizes([]);

  const handleRemoveSize = (size: string) => {
    setSizes((prev) => prev.filter((s) => s !== size));
  };

  // Custom-tab range expansion: "36-48" -> [36, 37, ..., 48]
  const expandSizeToken = (token: string): string[] => {
    const rangeMatch = token.match(/^(\d+)\s*(?:-|\.\.|to)\s*(\d+)$/i);
    if (!rangeMatch) return [token];
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [token];
    if (end - start > 100) return [token];
    const out: string[] = [];
    for (let i = start; i <= end; i++) out.push(String(i));
    return out;
  };

  const handleAddCustomSize = () => {
    const trimmed = sizeInput.trim();
    if (!trimmed) return;
    const tokens = trimmed
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .flatMap(expandSizeToken);
    setSizes((prev) => Array.from(new Set([...prev, ...tokens])));
    setSizeInput("");
  };

  const handleAddColor = () => {
    setColors((prev) => [
      ...prev,
      { id: newColorId(), name: "", code: "#000000" },
    ]);
  };

  const handleUpdateColor = (id: string, patch: Partial<ColorRow>) => {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleRemoveColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  const totalToCreate = previewRows.length;
  const canSubmit =
    !!productId &&
    totalToCreate > 0 &&
    validColors.length > 0 &&
    sizes.length > 0 &&
    isStockValid &&
    !bulkCreate.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const variants = previewRows.map((row, index) => ({
      sku: row.sku || undefined,
      name: row.name,
      size: row.size,
      color: row.color,
      color_code: row.colorCode,
      sort_order: index,
      initial_stock: row.stock,
    }));

    try {
      await bulkCreate.mutateAsync({ product_id: productId, variants });
      onOpenChange(false);
    } catch {
      // toast is already shown by the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate Variants
          </DialogTitle>
          <DialogDescription>
            Define colors and sizes once and create every combination as a
            variant. Empty Price means each variant inherits the product&apos;s
            base price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product */}
          <div className="space-y-3">
            <Label>
              Product <span className="text-red-500">*</span>
            </Label>
            <ProductCombobox
              value={productId || "all"}
              onChange={(v) => setProductId(v === "all" ? "" : v)}
              className="w-full"
            />
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Sizes <span className="text-red-500">*</span>
                {sizes.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {sizes.length} selected
                  </span>
                )}
              </Label>
              {sizes.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 hover:text-red-600"
                  onClick={handleClearSizes}
                >
                  Clear all
                </Button>
              )}
            </div>

            <Tabs defaultValue="eu-shoes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="eu-shoes">EU Shoes</TabsTrigger>
                <TabsTrigger value="apparel">Apparel</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              {/* EU Shoes (36–48) */}
              <TabsContent value="eu-shoes" className="space-y-2 pt-3">
                <div className="grid grid-cols-7 sm:grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5">
                  {EU_SHOE_SIZES.map((size) => {
                    const selected = sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={cn(
                          "h-9 rounded-md border text-sm font-medium transition-colors",
                          selected
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => handleSelectGroup(EU_SHOE_SIZES)}
                >
                  {EU_SHOE_SIZES.every((s) => sizes.includes(s))
                    ? "Deselect all (36–48)"
                    : "Select all (36–48)"}
                </Button>
              </TabsContent>

              {/* Apparel (XS–XXL) */}
              <TabsContent value="apparel" className="space-y-2 pt-3">
                <div className="grid grid-cols-6 gap-1.5">
                  {APPAREL_SIZES.map((size) => {
                    const selected = sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={cn(
                          "h-9 rounded-md border text-sm font-medium transition-colors",
                          selected
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => handleSelectGroup(APPAREL_SIZES)}
                >
                  {APPAREL_SIZES.every((s) => sizes.includes(s))
                    ? "Deselect all"
                    : "Select all"}
                </Button>
              </TabsContent>

              {/* Custom — for unusual sizes (kids 28–35, half sizes 7.5, etc.) */}
              <TabsContent value="custom" className="space-y-2 pt-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 35  or  7.5  or  28-35"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomSize}
                    disabled={!sizeInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Use this tab for sizes outside the standard ranges. You can
                  type a range like{" "}
                  <code className="bg-gray-100 px-1 rounded">28-35</code> to
                  add every size in between.
                </p>
              </TabsContent>
            </Tabs>

            {/* Selected sizes summary chips (always visible across tabs) */}
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="rounded-full p-0.5 hover:bg-gray-200"
                      aria-label={`Remove size ${size}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label>
              Colors <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {colors.map((color, index) => (
                <div key={color.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Color name (e.g. ${
                      index === 0 ? "Pink Coral" : "White"
                    })`}
                    value={color.name}
                    onChange={(e) =>
                      handleUpdateColor(color.id, { name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1 bg-white">
                    <input
                      type="color"
                      value={color.code}
                      onChange={(e) =>
                        handleUpdateColor(color.id, { code: e.target.value })
                      }
                      className="w-7 h-7 cursor-pointer border-0 bg-transparent p-0"
                      aria-label="Color code"
                    />
                    <Input
                      value={color.code}
                      onChange={(e) =>
                        handleUpdateColor(color.id, { code: e.target.value })
                      }
                      className="border-0 shadow-none focus-visible:ring-0 w-24 px-0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveColor(color.id)}
                    disabled={colors.length === 1}
                    aria-label="Remove color"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColor}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add color
              </Button>
            </div>
          </div>

          {/* SKU Prefix + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku-prefix">SKU prefix (optional)</Label>
              <Input
                id="sku-prefix"
                placeholder="e.g. NIKE-VOM18"
                value={skuPrefix}
                onChange={(e) => setSkuPrefix(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                SKUs will be generated as{" "}
                <code className="text-xs bg-gray-100 px-1 rounded">
                  {`{prefix}-{COLOR}-{SIZE}`}
                </code>
                .
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-stock">
                Initial stock per variant{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="initial-stock"
                type="number"
                min={0}
                step={1}
                placeholder="e.g. 10"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                aria-invalid={
                  initialStock.trim().length > 0 && !isStockValid
                }
                className={cn(
                  initialStock.trim().length > 0 &&
                    !isStockValid &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
              />
              <p className="text-xs text-gray-500">
                Required. Enter <code className="bg-gray-100 px-1 rounded">0</code>{" "}
                if you&apos;ll add real stock later.
              </p>
            </div>
          </div>

          {/* Preview */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Preview ({totalToCreate} variants will be created)</Label>
                {selectedProduct?.base_price ? (
                  <span className="text-xs text-gray-500">
                    Each variant inherits base price:{" "}
                    <strong>{formatPrice(selectedProduct.base_price)}</strong>
                  </span>
                ) : null}
              </div>
              <div className="border rounded-md max-h-[260px] overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[200px]">SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, index) => (
                      <TableRow key={`${row.color}-${row.size}-${index}`}>
                        <TableCell className="font-mono text-xs">
                          {row.sku || (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-4 h-4 rounded-full border"
                              style={{ backgroundColor: row.colorCode }}
                            />
                            <span>{row.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>{row.size}</TableCell>
                        <TableCell className="text-right">
                          {row.stock}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkCreate.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {bulkCreate.isPending
              ? "Generating..."
              : totalToCreate > 0
                ? `Generate ${totalToCreate} variant${totalToCreate === 1 ? "" : "s"}`
                : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateVariantsDialog;
