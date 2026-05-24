import type { CartItem } from "@/services/types";

/** Unit price for a cart line — same order as `useCartData` / cart subtotal. */
export function getCartLineUnitPrice(item: CartItem): number {
  const variantPrice = item.variant?.price;
  const productPrice = item.product?.base_price;
  return variantPrice || productPrice || item.price || 0;
}

export function computeCartTotals(items: CartItem[]) {
  const contents = items.map((item) => {
    const id = item.variant_id ?? item.product_id;
    const item_price = getCartLineUnitPrice(item);
    return {
      id,
      quantity: item.quantity,
      item_price,
    };
  });

  const value = contents.reduce(
    (sum, line) => sum + line.item_price * line.quantity,
    0,
  );
  const num_items = items.reduce((sum, item) => sum + item.quantity, 0);
  const content_ids = contents.map((line) => line.id);

  return { value, num_items, contents, content_ids };
}
