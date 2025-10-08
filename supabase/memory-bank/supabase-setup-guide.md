# Supabase Setup Guide for Footwear E-commerce

## Step 1: Create Supabase Account & Project

### 1.1 Sign up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 1.2 Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:

   - **Name**: `footwear-ecommerce` (or your brand name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your customers
   - **Pricing Plan**: Free tier is perfect to start

4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Project Credentials

### 2.1 Access Project Settings

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values (we'll need them later):
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2.2 Database Connection

1. Go to **Settings** → **Database**
2. Copy the **Connection string** (we'll use this for migrations)

## Step 3: Set Up Database Schema

### 3.1 Access SQL Editor

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"

### 3.2 Run Database Migrations

We'll create all the tables from our schema. I'll provide the SQL in the next step.

## Step 4: Configure Authentication

### 4.1 Enable Email Authentication

1. Go to **Authentication** → **Settings**
2. Under "Auth Providers", ensure **Email** is enabled
3. Configure email templates if needed

### 4.2 Set Up OAuth (Optional)

1. Under "Auth Providers", you can enable:
   - **Google** (recommended for easy signup)
   - **GitHub** (good for developers)
   - **Facebook** (for broader reach)

## Step 5: Set Up Storage

### 5.1 Create Storage Bucket

1. Go to **Storage**
2. Click "Create a new bucket"
3. Name: `product-images`
4. Make it **Public** (for product images)
5. Click "Create bucket"

### 5.2 Set Storage Policies

We'll configure RLS policies for secure file access.

## Step 6: Environment Variables

Create a `.env.local` file in your React project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Next Steps After Setup

1. ✅ Create database tables
2. ✅ Set up RLS policies
3. ✅ Create React project
4. ✅ Configure Supabase client
5. ✅ Build authentication
6. ✅ Create product catalog

## Cost Breakdown

### Free Tier Includes:

- **Database**: 500MB storage
- **Auth**: 50,000 monthly active users
- **Storage**: 1GB file storage
- **API**: 50,000 requests/month
- **Edge Functions**: 500,000 invocations/month

### When You Scale:

- **Pro Plan**: $25/month
- **Team Plan**: $599/month
- **Enterprise**: Custom pricing

## Security Best Practices

1. **Never expose service_role key** in frontend code
2. **Use RLS policies** for data protection
3. **Validate all inputs** on both client and server
4. **Use HTTPS** in production
5. **Regular security audits**

---

**Ready to proceed?** Let me know when you've created your Supabase project and I'll help you set up the database schema!
