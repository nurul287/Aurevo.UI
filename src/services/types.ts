// Base API Response type
export interface ApiResponse<T> {
  data: T | null;
  error: any;
  success: boolean;
}

// Auth related types
export interface SignUpData {
  email: string;
  password: string;
  userData?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

// Database Enums (matching Supabase schema)
export type UserGender = "male" | "female" | "other";
export type AddressType = "billing" | "shipping";
export type ProductGender = "men" | "women" | "unisex";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled";
export type PaymentMethod = "stripe" | "paypal" | "cash_on_delivery";

// User/Profile types (matching database schema)
export interface UserProfile {
  id: string; // UUID
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string; // DATE
  gender?: UserGender;
  avatar_url?: string;
  preferences?: {
    role?: "user" | "admin" | "super_admin";
    notifications?: boolean;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

// Category types
export interface Category {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  parent_id?: string; // UUID
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Brand types
export interface Brand {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Product types (matching database schema)
export interface Product {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  category_id?: string; // UUID
  brand_id?: string; // UUID
  gender?: ProductGender;
  material?: string;
  care_instructions?: string;
  weight?: number; // DECIMAL
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  base_price: number; // DECIMAL
  compare_at_price?: number; // DECIMAL
  is_active?: boolean;
  is_featured?: boolean;
  is_digital?: boolean;
  requires_shipping?: boolean;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  min_order_quantity?: number;
  max_order_quantity?: number;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// Product Variant types (matching database schema)
export interface ProductVariant {
  id: string; // UUID
  product_id: string; // UUID
  sku?: string;
  /** Nested when selected via `product_variants(..., inventory(*))` — legacy, not returned by GET /products. */
  inventory?: Inventory | Inventory[] | null;
  /** Source of truth for purchasable stock — mutated directly by order create/cancel. */
  stock?: number;
  reserved_stock?: number;
  name?: string;
  size?: string;
  color?: string;
  color_code?: string; // hex color code
  material?: string;
  weight?: number; // DECIMAL
  price?: number; // DECIMAL
  compare_at_price?: number; // DECIMAL
  barcode?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Public Product type (same as Product since cost_price is removed)
export type PublicProduct = Product;

// Public Product Variant type (same as ProductVariant since cost_price is removed)
export type PublicProductVariant = ProductVariant;

// Product Image types
export interface ProductImage {
  id: string; // UUID
  product_id: string; // UUID
  variant_id?: string; // UUID
  url: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
  created_at?: string;
}

// Inventory types
export interface Inventory {
  id: string; // UUID
  variant_id: string; // UUID
  location?: string;
  quantity: number;
  reserved_quantity?: number;
  available_quantity?: number; // GENERATED
  reorder_point?: number;
  reorder_quantity?: number;
  last_counted_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Product with relations
export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
}

// Public Product with relations (same as ProductWithVariants since cost_price is removed)
export interface PublicProductWithVariants extends PublicProduct {
  variants?: PublicProductVariant[];
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
}

// Cart related types (matching database schema)
export interface CartItem {
  id?: string; // UUID
  user_id?: string; // UUID
  session_id?: string;
  product_id: string; // UUID
  variant_id: string; // UUID
  quantity: number;
  price: number; // DECIMAL - price at time of adding to cart
  created_at?: string;
  updated_at?: string;
  // Relations
  product?: Product & { images?: ProductImage[] };
  variant?: ProductVariant;
}

// User Address types
export interface UserAddress {
  id: string; // UUID
  user_id: string; // UUID
  type?: AddressType;
  is_default?: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Order types
export interface Order {
  id: string; // UUID
  order_number: string;
  user_id?: string; // UUID
  /** Null when guest did not provide an email */
  email?: string | null;
  phone?: string;
  // Order totals
  subtotal: number; // DECIMAL
  tax_amount?: number; // DECIMAL
  shipping_amount?: number; // DECIMAL
  discount_amount?: number; // DECIMAL
  total_amount: number; // DECIMAL
  // Order status
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
  // Shipping
  shipping_method_id?: string; // UUID
  tracking_number?: string;
  estimated_delivery_date?: string; // DATE
  // Courier (Steadfast)
  courier_provider?: string | null;
  courier_consignment_id?: number | null;
  courier_status?: string | null;
  courier_status_updated_at?: string | null;
  // Addresses
  billing_address: any; // JSONB
  shipping_address: any; // JSONB
  // Additional info
  notes?: string;
  internal_notes?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

// NOTE: api.get() deep-converts every response key camelCase → snake_case
// (see src/lib/api.ts), so these must be declared in snake_case to match
// what's actually returned at runtime, even though the BE sends camelCase.
export interface CourierTrackingEvent {
  status: string | null;
  message: string | null;
  event_at: string;
}

export interface PublicTracking {
  tracking_code: string | null;
  provider: string | null;
  courier_status: string | null;
  order_status: string | null;
  estimated_delivery_date: string | null;
  events: CourierTrackingEvent[];
}

// Order Item types
export interface OrderItem {
  id: string; // UUID
  order_id: string; // UUID
  product_id?: string; // UUID
  variant_id?: string; // UUID
  product_name: string;
  variant_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number; // DECIMAL
  total_price: number; // DECIMAL
  created_at?: string;
}

// Payment types
export interface Payment {
  id: string; // UUID
  order_id: string; // UUID
  payment_method: PaymentMethod;
  payment_intent_id?: string;
  amount: number; // DECIMAL
  currency?: string;
  status?: "pending" | "succeeded" | "failed" | "cancelled" | "refunded";
  gateway_response?: any; // JSONB
  processed_at?: string;
  created_at?: string;
}

// Product Review types
export interface ProductReview {
  id: string; // UUID
  product_id: string; // UUID
  user_id: string; // UUID
  order_id?: string; // UUID
  rating: number; // 1-5
  title?: string;
  content?: string;
  is_verified_purchase?: boolean;
  is_approved?: boolean;
  helpful_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Query options
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
