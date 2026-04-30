-- ============================================================
-- 015_wipe_ecommerce_data.sql
-- ============================================================
-- Purpose : Reset all e-commerce data so it can be re-entered
--           manually through the admin dashboard.
-- Keeps   : auth.users, public.profiles, public.user_addresses
-- Wipes   : products, variants, images, inventory, inventory_movements,
--           categories, brands, cart, wishlist, reviews,
--           orders, order_items, payments
-- Safe    : Wrapped in a transaction. Triggers are temporarily
--           disabled (session_replication_role = replica) so any
--           audit / webhook triggers do not fire during the wipe.
-- ============================================================

BEGIN;

-- Disable triggers / RLS bypass for the wipe
SET session_replication_role = replica;

-- 1) Order-related (children before parents)
TRUNCATE TABLE
  public.payments,
  public.order_items,
  public.orders
RESTART IDENTITY CASCADE;

-- 2) Cart, wishlist, reviews
TRUNCATE TABLE
  public.cart_items,
  public.wishlist_items,
  public.product_reviews
RESTART IDENTITY CASCADE;

-- 3) Inventory & product structure
TRUNCATE TABLE
  public.inventory_movements,
  public.inventory,
  public.product_images,
  public.product_variants,
  public.products
RESTART IDENTITY CASCADE;

-- 4) Catalog metadata
TRUNCATE TABLE
  public.categories,
  public.brands
RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;
