# Payment Method Enum Update

## Overview

Updated the `payment_method` enum from three specific values (`stripe`, `paypal`, `cash_on_delivery`) to two generic values (`cash`, `online`) for better flexibility and simplicity.

## Changes Made

### Database Migration (`008_update_payment_method_enum.sql`)

#### Old Enum Values:

- `stripe`
- `paypal`
- `cash_on_delivery`

#### New Enum Values:

- `cash` - For cash on delivery payments
- `online` - For all online payment methods (Stripe, PayPal, etc.)

### Migration Steps:

1. **Add New Values**: Added `cash` and `online` to existing enum
2. **Migrate Data**: Updated existing payment records
   - `cash_on_delivery` → `cash`
   - `stripe` and `paypal` → `online`
3. **Replace Enum**: Created new enum type and replaced the old one
4. **Update Function**: Updated `create_order` stored procedure to use new default value (`cash` instead of `cash_on_delivery`)

### Frontend Changes

#### 1. **Checkout Page** (`src/pages/checkout-page.tsx`)

```typescript
// Old values
<RadioGroupItem value="stripe" id="stripe" />
<RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />

// New values
<RadioGroupItem value="online" id="online" />
<RadioGroupItem value="cash" id="cash" />
```

Default payment method: `"cash"`

#### 2. **Order Mutation** (`src/services/order/use-order-mutation.ts`)

```typescript
// Old default
payment_method: data.paymentMethod || "cash_on_delivery";

// New default
payment_method: data.paymentMethod || "cash";
```

## Benefits

1. **Simpler Structure**: Only two payment types instead of three specific methods
2. **More Flexible**: Easy to add new online payment providers without changing the enum
3. **Better UX**: Clearer payment options for users
4. **Easier Maintenance**: Less coupling between database schema and payment providers

## Usage

### Frontend

Users now see two clear options:

- **Online Payment** - For card/digital payments (Stripe, PayPal, etc.)
- **Cash on Delivery** - For paying cash upon delivery

### Backend

The stored procedure accepts:

- `'cash'` - Default value for cash on delivery
- `'online'` - For online payment methods

### Edge Function

No changes needed - automatically uses the new enum values

## Testing

After running the migration:

1. **Verify Existing Data**:

   ```sql
   SELECT payment_method, COUNT(*)
   FROM payments
   GROUP BY payment_method;
   ```

   Should show only `cash` and `online`

2. **Test New Orders**:

   - Create order with `cash` payment method ✅
   - Create order with `online` payment method ✅

3. **Frontend Testing**:
   - Select "Cash on Delivery" → sends `"cash"`
   - Select "Online Payment" → sends `"online"`

## Rollback

If you need to rollback to the old enum:

```sql
-- Create old enum
CREATE TYPE payment_method_old AS ENUM ('stripe', 'paypal', 'cash_on_delivery');

-- Convert data back
UPDATE payments
SET payment_method = 'cash_on_delivery'::payment_method_old
WHERE payment_method = 'cash';

UPDATE payments
SET payment_method = 'stripe'::payment_method_old
WHERE payment_method = 'online';

-- Switch enum types
ALTER TABLE payments ALTER COLUMN payment_method TYPE payment_method_old;
DROP TYPE payment_method;
ALTER TYPE payment_method_old RENAME TO payment_method;
```

## Files Modified

- `supabase/migrations/008_update_payment_method_enum.sql` - Database migration
- `src/pages/checkout-page.tsx` - Updated radio button values
- `src/services/order/use-order-mutation.ts` - Updated default value
