import { isMetaPixelEnabled, trackMetaPixelAddToCartFromCart } from "./client";
import { fetchCartData } from "@/services/cart/use-cart-query";

/** Reload cart from API and fire AddToCart with the same totals as the cart UI. */
export async function trackMetaPixelAddToCartAfterChange(
  userId?: string,
  sessionId?: string,
): Promise<void> {
  if (!isMetaPixelEnabled()) return;
  if (!userId && !sessionId) return;

  try {
    const cart = await fetchCartData(userId, sessionId);
    if (cart.items.length > 0) {
      trackMetaPixelAddToCartFromCart(cart.items);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[meta-pixel] Could not load cart for AddToCart", error);
    }
  }
}
