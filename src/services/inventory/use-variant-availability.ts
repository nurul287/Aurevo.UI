import { useQuery } from "@tanstack/react-query";
import {
  fetchVariantAvailableQuantity,
  fetchVariantsAvailableQuantities,
} from "./variant-availability";

export function useVariantAvailableQuantity(
  variantId: string | undefined,
  options?: { trackInventory?: boolean },
) {
  const enabled =
    Boolean(variantId) && options?.trackInventory !== false;

  return useQuery({
    queryKey: ["inventory", "available", variantId],
    queryFn: () => fetchVariantAvailableQuantity(variantId!),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useVariantsAvailableQuantities(
  variantIds: string[],
  options?: { enabled?: boolean },
) {
  const sortedKey = [...new Set(variantIds.filter(Boolean))].sort().join(",");

  return useQuery({
    queryKey: ["inventory", "available", "batch", sortedKey],
    queryFn: () => fetchVariantsAvailableQuantities(variantIds),
    enabled: (options?.enabled ?? true) && sortedKey.length > 0,
    staleTime: 30 * 1000,
  });
}
