import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAdminProducts } from "@/services/product";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

interface ProductComboboxProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ProductCombobox({ value, onChange, className }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useAdminProducts({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    enabled: open,
  });

  const [items, setItems] = useState<{ id: string; name: string }[]>([]);

  // Reset items when search changes
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [debouncedSearch]);

  // Accumulate pages
  useEffect(() => {
    if (!data?.data) return;
    if (page === 1) {
      setItems(data.data.map((p) => ({ id: p.id, name: p.name })));
    } else {
      setItems((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = data.data
          .filter((p) => !existingIds.has(p.id))
          .map((p) => ({ id: p.id, name: p.name }));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetching && data && page < data.totalPages) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFetching, data, page]);

  const selectedName = value === "all" ? null : items.find((p) => p.id === value)?.name;

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full md:w-[220px] justify-between font-normal", className)}
        >
          <span className="truncate">
            {selectedName ?? "All Products"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="flex items-center border-b px-3 py-2 gap-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent",
              value === "all" && "font-medium"
            )}
            onClick={() => handleSelect("all")}
          >
            <Check className={cn("h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
            All Products
          </div>
          {items.map((product) => (
            <div
              key={product.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                value === product.id && "font-medium"
              )}
              onClick={() => handleSelect(product.id)}
            >
              <Check className={cn("h-4 w-4 shrink-0", value === product.id ? "opacity-100" : "opacity-0")} />
              <span className="truncate">{product.name}</span>
            </div>
          ))}
          {isFetching && (
            <div className="py-2 text-center text-xs text-muted-foreground">Loading...</div>
          )}
          {!isFetching && items.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">No products found</div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
