/**
 * One-line summary of a JSON shipping/billing address from checkout.
 */
export function formatOrderShippingLine(address: unknown): string {
  if (!address || typeof address !== "object") return "—";
  const a = address as Record<string, string | undefined>;
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
  const area = [a.upazila, a.district].filter(Boolean).join(", ");
  const parts = [
    name || undefined,
    a.address?.trim() || undefined,
    area || undefined,
    a.phone?.trim() || undefined,
  ].filter(Boolean) as string[];

  return parts.length > 0 ? parts.join(" · ") : "—";
}
