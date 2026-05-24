import { CURRENCY_CODE } from "@/lib/currency";
import { computeCartTotals } from "@/services/cart/cart-totals";
import type { CartItem } from "@/services/types";
import type {
  FbqFunction,
  MetaPixelEventParams,
  MetaPixelStandardEvent,
} from "./types";

const PIXEL_SCRIPT_SRC =
  "https://connect.facebook.net/en_US/fbevents.js";

/** Meta Pixel IDs are numeric (typically 15–16 digits). */
const PIXEL_ID_PATTERN = /^\d{5,20}$/;

export function getMetaPixelId(): string | undefined {
  const id = import.meta.env.VITE_META_PIXEL_ID?.trim();
  if (!id || !PIXEL_ID_PATTERN.test(id)) {
    return undefined;
  }
  return id;
}

export function isMetaPixelEnabled(): boolean {
  return Boolean(getMetaPixelId());
}

/** Dev helper: log whether pixel env is configured (call once on app load). */
export function logMetaPixelStatus(): void {
  if (!import.meta.env.DEV) return;

  const raw = import.meta.env.VITE_META_PIXEL_ID?.trim();
  if (!raw) {
    console.warn(
      "[meta-pixel] VITE_META_PIXEL_ID is not set — tracking disabled. Add it to .env.local and restart `pnpm dev`.",
    );
    return;
  }
  if (!PIXEL_ID_PATTERN.test(raw)) {
    console.warn(
      "[meta-pixel] VITE_META_PIXEL_ID must be numeric only (e.g. 1409609890385063). Current value is invalid.",
    );
    return;
  }
  console.info("[meta-pixel] Pixel ID configured:", raw);
}

export function shouldTrackRoute(pathname: string): boolean {
  return !pathname.startsWith("/admin");
}

function getFbq(): FbqFunction | undefined {
  if (typeof window === "undefined") return undefined;
  return window.fbq;
}

/**
 * Meta's official bootstrap snippet (queues calls until fbevents.js loads).
 */
function injectOfficialPixelBootstrap(pixelId: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__metaPixelInitialized) return;

  const existing = document.querySelector('script[data-meta-pixel="bootstrap"]');
  if (existing) return;

  const script = document.createElement("script");
  script.setAttribute("data-meta-pixel", "bootstrap");
  script.textContent = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'${PIXEL_SCRIPT_SRC}');
fbq('init', '${pixelId}');
`;
  document.head.appendChild(script);
  window.__metaPixelInitialized = true;

  if (import.meta.env.DEV) {
    console.info("[meta-pixel] Initialized pixel", pixelId);
  }
}

/** Load fbevents.js via Meta's bootstrap and init the pixel. Safe to call multiple times. */
export function initMetaPixel(): boolean {
  const pixelId = getMetaPixelId();
  if (!pixelId || typeof window === "undefined") return false;

  injectOfficialPixelBootstrap(pixelId);
  return true;
}

export function trackMetaPixelEvent(
  event: MetaPixelStandardEvent,
  params?: MetaPixelEventParams,
): void {
  if (!isMetaPixelEnabled()) return;
  initMetaPixel();
  getFbq()?.("track", event, {
    currency: CURRENCY_CODE,
    ...params,
  });
}

export function trackMetaPixelPageView(): void {
  if (!isMetaPixelEnabled()) return;
  initMetaPixel();
  getFbq()?.("track", "PageView");
}

export function trackMetaPixelViewContent(params: {
  productId: string;
  productName?: string;
  value?: number;
}): void {
  trackMetaPixelEvent("ViewContent", {
    content_ids: [params.productId],
    content_type: "product",
    content_name: params.productName,
    value: params.value,
    contents: [
      {
        id: params.productId,
        quantity: 1,
        item_price: params.value,
      },
    ],
  });
}

/**
 * AddToCart with full cart value — matches cart subtotal in the UI.
 * Meta uses this for remarketing; `value` / `num_items` reflect the whole cart.
 */
const addToCartDedupe = { fingerprint: "", at: 0 };
const ADD_TO_CART_DEDUPE_MS = 2000;

export function trackMetaPixelAddToCartFromCart(items: CartItem[]): void {
  if (items.length === 0) return;

  const { value, num_items, contents, content_ids } = computeCartTotals(items);
  const fingerprint = `${value}|${num_items}|${[...content_ids].sort().join(",")}`;
  const now = Date.now();

  if (
    fingerprint === addToCartDedupe.fingerprint &&
    now - addToCartDedupe.at < ADD_TO_CART_DEDUPE_MS
  ) {
    return;
  }
  addToCartDedupe.fingerprint = fingerprint;
  addToCartDedupe.at = now;

  trackMetaPixelEvent("AddToCart", {
    content_ids,
    content_type: "product",
    value,
    num_items,
    contents,
    eventID: `cart-${fingerprint}`,
  });
}

export function trackMetaPixelInitiateCheckout(params: {
  value: number;
  numItems: number;
  contentIds: string[];
}): void {
  trackMetaPixelEvent("InitiateCheckout", {
    value: params.value,
    num_items: params.numItems,
    content_ids: params.contentIds,
    content_type: "product",
  });
}

export function trackMetaPixelPurchase(params: {
  orderId: string;
  value: number;
  numItems: number;
  contentIds: string[];
}): void {
  const storageKey = `meta_pixel_purchase_${params.orderId}`;
  if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(storageKey)) {
    return;
  }

  trackMetaPixelEvent("Purchase", {
    value: params.value,
    num_items: params.numItems,
    content_ids: params.contentIds,
    content_type: "product",
    eventID: params.orderId,
  });

  sessionStorage?.setItem(storageKey, "1");
}

export function getMetaPixelNoscriptImageUrl(): string | undefined {
  const pixelId = getMetaPixelId();
  if (!pixelId) return undefined;
  return `https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`;
}
