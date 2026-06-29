import { apiFetch } from "@/lib/api";

export type VariantAvailabilityMap = Record<string, number>;

export function computeAvailableUnits(
  quantity: number | null | undefined,
  reserved: number | null | undefined,
): number {
  return Math.max(0, (quantity ?? 0) - (reserved ?? 0));
}

type AvailabilityRow = {
  variant_id: string;
  quantity: number;
  reserved_quantity: number;
};

export async function fetchVariantAvailableQuantity(
  variantId: string,
): Promise<number | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: AvailabilityRow[] }>(
      `/inventory/availability?variantIds=${encodeURIComponent(variantId)}`,
    );
    const row = res?.data?.[0];
    if (!row) return null;
    return computeAvailableUnits(row.quantity, row.reserved_quantity);
  } catch {
    return 0;
  }
}

export async function fetchVariantsAvailableQuantities(
  variantIds: string[],
): Promise<VariantAvailabilityMap> {
  const uniqueIds = [...new Set(variantIds.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const map: VariantAvailabilityMap = Object.fromEntries(
    uniqueIds.map((id) => [id, 0]),
  );

  try {
    const params = new URLSearchParams();
    uniqueIds.forEach((id) => params.append("variantIds", id));
    const res = await apiFetch<{ success: boolean; data: AvailabilityRow[] }>(
      `/inventory/availability?${params.toString()}`,
    );
    for (const row of res?.data ?? []) {
      if (row.variant_id) {
        map[row.variant_id] = computeAvailableUnits(row.quantity, row.reserved_quantity);
      }
    }
  } catch {
    // return zeros on failure
  }

  return map;
}
