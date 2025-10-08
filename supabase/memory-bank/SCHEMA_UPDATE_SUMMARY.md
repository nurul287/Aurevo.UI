# Schema Update Summary

## Overview

Updated the initial database schema and RLS policies to reflect recent changes made through migrations, including guest order support and simplified payment methods.

## Changes Made

### 1. **Initial Schema** (`001_initial_schema.sql`)

#### Payment Method Enum Updated

```sql
-- Old
CREATE TYPE payment_method AS ENUM ('stripe', 'paypal', 'cash_on_delivery');

-- New
CREATE TYPE payment_method AS ENUM ('cash', 'online');
```

**Rationale**: Simplified to two generic payment types for better flexibility.

#### Orders Table - Added Guest Support Columns

```sql
CREATE TABLE orders (
  -- ... existing columns ...

  -- Guest order support (NEW)
  session_id TEXT,
  guest_token TEXT,
  guest_token_expires TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**New Columns:**

- `session_id` - Links guest orders to session for cart cleanup
- `guest_token` - Secure token for guest users to access their orders
- `guest_token_expires` - Expiration timestamp (typically 30 days)

#### New Indexes Added

```sql
-- Order indexes (NEW)
CREATE INDEX idx_orders_guest_token ON orders(guest_token);
CREATE INDEX idx_orders_session ON orders(session_id);
```

**Rationale**: Improve performance for guest order lookups and session-based queries.

---

### 2. **RLS Policies** (`002_complete_rls_setup.sql`)

#### Removed Order Policies (Temporarily)

**Removed:**

- `"Users can view own orders"`
- `"Allow orders for users and guests"`
- `"Users can update own orders"`
- `"Users can view own order items"`
- `"Allow order items for users and guests"`
- `"Admins can manage all orders"`
- `"Admins can manage all order items"`

**Replaced with:**

```sql
-- Orders policies
-- NOTE: RLS policies for orders and order_items are temporarily disabled
-- They will be added back with proper guest token support in a future migration
```

**Rationale**:

- Current RLS policies don't properly handle guest token authentication
- Using stored procedure with `SECURITY DEFINER` for now
- Will add back comprehensive RLS policies with guest token support later

#### Updated Comments

```sql
COMMENT ON TABLE orders IS 'RLS temporarily disabled - will be re-enabled with guest token support';
```

---

## Migration History Alignment

These changes align the initial schema with the following migrations:

1. **006_fix_guest_order_rls.sql** - Added guest order columns
2. **007_improved_create_order.sql** - Improved stored procedure
3. **008_update_payment_method_enum.sql** - Updated payment method enum

---

## Current State

### Orders Table Schema

```sql
orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE,
  user_id UUID (nullable - for guest orders),
  email TEXT,
  phone TEXT,
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  shipping_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  status order_status,
  payment_status payment_status,
  fulfillment_status fulfillment_status,
  shipping_method_id UUID,
  tracking_number TEXT,
  estimated_delivery_date DATE,
  billing_address JSONB,
  shipping_address JSONB,
  notes TEXT,
  internal_notes TEXT,
  source TEXT,
  session_id TEXT,           -- NEW
  guest_token TEXT,          -- NEW
  guest_token_expires TIMESTAMPTZ,  -- NEW
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Payment Method Enum

```sql
'cash'   -- Cash on delivery
'online' -- Online payments (Stripe, PayPal, etc.)
```

### RLS Status

- ✅ **Profiles** - RLS enabled
- ✅ **User Addresses** - RLS enabled
- ✅ **Cart Items** - RLS enabled (with guest session support)
- ✅ **Wishlist Items** - RLS enabled
- ⚠️ **Orders** - RLS temporarily disabled
- ⚠️ **Order Items** - RLS temporarily disabled
- ✅ **Payments** - RLS enabled
- ✅ **Product Reviews** - RLS enabled
- ✅ **All Catalog Tables** - RLS enabled

---

## Security Considerations

### Current Order Security

**Without RLS, orders are secured through:**

1. **Stored Procedure**: `create_order` function with `SECURITY DEFINER`
2. **Edge Function**: Validates user authentication before calling stored procedure
3. **Guest Tokens**: Secure random tokens for guest order access
4. **Service Role Key**: Only edge function has access via service role

**Access Pattern:**

```
Frontend → Edge Function (validates auth) → Stored Procedure (creates order)
                                           ↓
                                    Generates guest token for guests
```

### Future RLS Implementation

When RLS is re-enabled, it should:

1. Allow users to view their own orders (`user_id = auth.uid()`)
2. Allow guests to view orders with valid guest token
3. Check guest token expiration
4. Allow admins to view all orders
5. Prevent unauthorized access

**Example future policy:**

```sql
CREATE POLICY "Users and guests can view their orders" ON orders
  FOR SELECT USING (
    -- Authenticated user viewing their order
    (auth.uid() = user_id) OR
    -- Admin viewing any order
    is_admin() OR
    -- Guest with valid token (implement custom function)
    verify_guest_order_access(id, current_setting('request.jwt.claims', true)::json->>'guest_token')
  );
```

---

## Testing Checklist

After applying these schema changes:

- [ ] Verify payment method enum has only 'cash' and 'online'
- [ ] Verify orders table has session_id, guest_token, guest_token_expires columns
- [ ] Verify indexes exist for guest_token and session_id
- [ ] Test guest order creation (should work via stored procedure)
- [ ] Test authenticated user order creation
- [ ] Verify guest can access order with guest token
- [ ] Verify RLS is disabled for orders and order_items
- [ ] Test admin cannot bypass security (since RLS is disabled, use stored procedure security)

---

## Files Modified

1. `supabase/migrations/001_initial_schema.sql`

   - Updated payment_method enum
   - Added guest order columns to orders table
   - Added indexes for guest_token and session_id

2. `supabase/migrations/002_complete_rls_setup.sql`
   - Removed order and order_items RLS policies
   - Added comments explaining temporary removal
   - Updated table comments

---

## Next Steps

1. **Implement Guest Token Verification Function**

   ```sql
   CREATE FUNCTION verify_guest_order_access(order_id UUID, token TEXT)
   RETURNS BOOLEAN
   ```

2. **Re-enable RLS with Guest Support**

   - Create comprehensive policies for orders
   - Create comprehensive policies for order_items
   - Test thoroughly with both authenticated and guest users

3. **Add Order History Page**

   - For authenticated users: show all orders
   - For guests: show order with guest token lookup

4. **Admin Dashboard**
   - Add order management interface
   - Ensure admins can view all orders regardless of RLS
