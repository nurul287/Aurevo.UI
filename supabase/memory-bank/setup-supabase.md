# Supabase Setup Instructions

## Step 1: Create Your Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up
2. **Click "New Project"**
3. **Fill in the details:**

   - Name: `footwear-ecommerce`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your customers
   - Pricing: Free tier

4. **Wait 2-3 minutes** for setup to complete

## Step 2: Get Your Project Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - Project URL: `https://your-project-id.supabase.co`
   - anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - service_role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New query"**
3. **Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`**
4. **Click "Run"** to execute the migration
5. **Copy and paste the contents of `supabase/migrations/002_rls_policies.sql`**
6. **Click "Run"** to execute the RLS policies

## Step 4: Set Up Storage

1. **Go to Storage** in your Supabase dashboard
2. **Click "Create a new bucket"**
3. **Name it:** `product-images`
4. **Make it Public** (for product images)
5. **Click "Create bucket"**

## Step 5: Configure Authentication

1. **Go to Authentication → Settings**
2. **Under "Auth Providers":**
   - Ensure **Email** is enabled
   - Optionally enable **Google** or **GitHub** for easier signup
3. **Under "Email Templates":**
   - Customize the confirmation and reset password emails

## Step 6: Test Your Setup

1. **Go to Table Editor** in your Supabase dashboard
2. **You should see these tables:**

   - profiles
   - user_addresses
   - categories
   - brands
   - products
   - product_variants
   - product_images
   - inventory
   - cart_items
   - wishlist_items
   - orders
   - order_items
   - payments
   - product_reviews

3. **Check that sample data was inserted:**
   - Go to `categories` table - you should see 5 categories
   - Go to `brands` table - you should see 5 brands

## Step 7: Create Your First Admin User

1. **Go to Authentication → Users**
2. **Click "Add user"**
3. **Create a user with:**
   - Email: `admin@yourbrand.com`
   - Password: Choose a strong password
4. **After creating, go to Table Editor → profiles**
5. **Find your new user and update their preferences:**
   ```json
   {
     "role": "admin"
   }
   ```

## Step 8: Environment Variables

Create a `.env.local` file in your React project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### If you get permission errors:

- Make sure you ran both SQL migrations
- Check that RLS policies are enabled
- Verify your user has admin role in profiles table

### If tables don't appear:

- Check the SQL Editor for any error messages
- Make sure you ran the migrations in order
- Try refreshing the Table Editor

### If authentication doesn't work:

- Check Authentication → Settings
- Verify email templates are configured
- Test with a simple email/password signup

## Next Steps

Once your Supabase setup is complete:

1. ✅ Database schema created
2. ✅ RLS policies configured
3. ✅ Storage bucket created
4. ✅ Admin user created
5. ✅ Environment variables set

**Ready to build the React frontend!** 🚀

Let me know when you've completed the Supabase setup and I'll help you create the React application.
