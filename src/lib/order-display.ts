import type { Order } from "@/services/types";

type OrderWithUser = Order & {
  user?: { first_name?: string; last_name?: string } | null;
};

function nameFromAddress(addr: Record<string, unknown> | undefined): string {
  if (!addr) return "";
  const first = String(addr.firstName ?? addr.first_name ?? "").trim();
  const last = String(addr.lastName ?? addr.last_name ?? "").trim();
  return [first, last].filter(Boolean).join(" ");
}

/** Display name for admin lists (registered user or guest checkout). */
export function getOrderCustomerName(order: OrderWithUser): string {
  const fromUser = [order.user?.first_name, order.user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fromUser) return fromUser;

  const fromBilling = nameFromAddress(
    order.billing_address as Record<string, unknown> | undefined,
  );
  if (fromBilling) return fromBilling;

  const fromShipping = nameFromAddress(
    order.shipping_address as Record<string, unknown> | undefined,
  );
  if (fromShipping) return fromShipping;

  if (order.phone?.trim()) return order.phone.trim();
  if (order.email?.trim()) return order.email.trim();
  return "Guest";
}
