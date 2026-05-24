/** Meta Pixel standard event names (Events Manager). */
export type MetaPixelStandardEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "Search"
  | "AddPaymentInfo"
  | "AddToWishlist";

export type MetaPixelContentItem = {
  id: string;
  quantity?: number;
  item_price?: number;
};

export type MetaPixelEventParams = {
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  contents?: MetaPixelContentItem[];
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  /** Deduplicate Purchase events per order. */
  eventID?: string;
};

export type FbqCommand = "init" | "track" | "trackCustom";

export interface FbqFunction {
  (command: "init", pixelId: string): void;
  (
    command: "track",
    event: MetaPixelStandardEvent,
    params?: MetaPixelEventParams,
  ): void;
  (command: "trackCustom", event: string, params?: MetaPixelEventParams): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: FbqFunction;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __metaPixelInitialized?: boolean;
  }
}

export {};
