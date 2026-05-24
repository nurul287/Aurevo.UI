import { supabase } from "@/lib/supabase";

export type VariantAvailabilityMap = Record<string, number>;

/** Available units = on-hand quantity minus reserved (matches create_order check). */
export function computeAvailableUnits(
  quantity: number | null | undefined,
  reserved: number | null | undefined,
): number {
  return Math.max(0, (quantity ?? 0) - (reserved ?? 0));
}

/** Returns null when no inventory row exists (product may not track stock). */
export async function fetchVariantAvailableQuantity(
  variantId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("inventory")
    .select("quantity, reserved_quantity")
    .eq("variant_id", variantId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching variant inventory:", error);
    return 0;
  }

  if (!data) return null;
  return computeAvailableUnits(data.quantity, data.reserved_quantity);
}

export async function fetchVariantsAvailableQuantities(
  variantIds: string[],
): Promise<VariantAvailabilityMap> {
  const uniqueIds = [...new Set(variantIds.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const { data, error } = await supabase
    .from("inventory")
    .select("variant_id, quantity, reserved_quantity")
    .in("variant_id", uniqueIds);

  if (error) {
    console.error("Error fetching variant inventory:", error);
    return Object.fromEntries(uniqueIds.map((id) => [id, 0]));
  }

  const map: VariantAvailabilityMap = Object.fromEntries(
    uniqueIds.map((id) => [id, 0]),
  );

  for (const row of data ?? []) {
    if (row.variant_id) {
      map[row.variant_id] = computeAvailableUnits(
        row.quantity,
        row.reserved_quantity,
      );
    }
  }

  return map;
}
