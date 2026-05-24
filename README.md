# 🛍️ Aurevo Fashion - Premium Footwear E-commerce

A modern, full-stack e-commerce application built with React, TypeScript, and Supabase, featuring a premium UI design and comprehensive shopping experience.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.58.0-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-cyan)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)

## ✨ Features

### 🎨 **Premium UI/UX**

- **Animated Hero Section** with gradient backgrounds and floating blob animations
- **Interactive Product Cards** with hover effects, wishlist, and quick view
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Modern Typography** with proper hierarchy and spacing
- **Smooth Animations** and micro-interactions throughout

### 🛒 **Shopping Experience**

- **Product Catalog** with category filtering and pagination
- **Shopping Cart** supporting both guest and authenticated users
- **Wishlist Functionality** with heart icons on product cards
- **Product Search** and filtering capabilities
- **Order Management** with confirmation and tracking

### 🔐 **Authentication & Security**

- **Supabase Auth** integration with email/password
- **Row Level Security (RLS)** policies for data protection
- **Guest User Support** with session-based cart management
- **Protected Routes** with authentication guards
- **Admin Dashboard** for product and order management

### 💳 **Payment & Orders**

- **Multiple Payment Methods** (Cash on Delivery, Online)
- **Order Processing** with stored procedures
- **Inventory Management** with stock tracking
- **Order Confirmation** and email notifications
- **Guest Order Tracking** with unique tokens

### 🗄️ **Database & Backend**

- **PostgreSQL** with Supabase
- **Stored Procedures** for complex operations
- **Database Migrations** with version control
- **Real-time Updates** with Supabase subscriptions
- **Edge Functions** for serverless operations

## 🚀 Tech Stack

### **Frontend**

- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.9.2** - Type-safe development
- **Vite 7.1.7** - Fast build tool and dev server
- **React Router 7.9.3** - Client-side routing
- **TanStack Query 5.90.2** - Server state management
- **Tailwind CSS 4.1.13** - Utility-first CSS framework

### **UI Components**

- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Shadcn/ui** - Reusable component library
- **Tailwind Animate** - Animation utilities

### **Backend & Database**

- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level security
- **Edge Functions** - Serverless functions

### **Development Tools**

- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PNPM** - Fast package manager
- **Git** - Version control

## 📁 Project Structure

```
footwear-ecommerce/
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 guards/         # Route protection components
│   │   └── 📁 ui/             # Shadcn/ui components
│   ├── 📁 contexts/           # React contexts
│   │   ├── auth-context.tsx   # Authentication state
│   │   └── guest-cart-context.tsx # Guest cart management
│   ├── 📁 hooks/              # Custom React hooks
│   │   └── use-cart.ts        # Cart operations hook
│   ├── 📁 lib/                # Utility libraries
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Helper functions
│   ├── 📁 pages/              # Page components
│   │   ├── home-page.tsx      # Premium home page
│   │   ├── products-page.tsx  # Product catalog
│   │   ├── cart-page.tsx      # Shopping cart
│   │   ├── checkout-page.tsx  # Checkout process
│   │   └── ...                # Other pages
│   ├── 📁 routes/             # Route definitions
│   │   ├── public-routes.tsx  # Public routes
│   │   ├── protected-routes.tsx # Protected routes
│   │   └── admin-routes.tsx   # Admin routes
│   ├── 📁 services/           # API services
│   │   ├── 📁 auth/           # Authentication services
│   │   ├── 📁 cart/           # Cart services
│   │   ├── 📁 product/        # Product services
│   │   ├── 📁 order/          # Order services
│   │   └── 📁 user/           # User services
│   └── 📁 types/              # TypeScript type definitions
├── 📁 supabase/
│   ├── 📁 migrations/         # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_complete_rls_setup.sql
│   │   ├── 003_sample_products.sql
│   │   ├── 007_improved_create_order.sql
│   │   └── 008_update_payment_method_enum.sql
│   └── 📁 memory-bank/        # Documentation
├── 📄 package.json            # Dependencies and scripts
├── 📄 vite.config.ts          # Vite configuration
├── 📄 tailwind.config.js      # Tailwind CSS configuration
├── 📄 tsconfig.json           # TypeScript configuration
└── 📄 README.md               # This file
```

## 🛠️ Installation & Setup

### **Prerequisites**

- Node.js 18+
- PNPM (recommended) or npm
- Supabase account

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/footwear-ecommerce.git
cd footwear-ecommerce
```

### **2. Install Dependencies**

```bash
pnpm install
# or
npm install
```

### **3. Environment Setup**

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Facebook Messenger button (optional — hidden until set; opens m.me chat)
VITE_FACEBOOK_PAGE_ID=your_facebook_page_id

# Meta Pixel for ads / remarketing (optional — omit locally to skip tracking)
VITE_META_PIXEL_ID=your_meta_pixel_id

```

**Production (Vercel):** Add `VITE_META_PIXEL_ID` under Project → Settings → Environment Variables for **Production** (and Preview if needed), then redeploy. Vite bakes env vars at build time — changing them without redeploying has no effect.

```

### **4. Database Setup**

Use the Supabase CLI (migrations live in `supabase/migrations/`). See **[supabase/README.md](supabase/README.md)** for the full playbook.

```bash
pnpm install
pnpm db:link          # one-time: link to your Supabase project
pnpm db:start         # local Postgres (Docker)
pnpm db:reset         # apply all migrations locally
pnpm db:types:local   # regenerate src/types/database.ts
```

For remote: `pnpm db:push` after linking. CI applies migrations on push to `main` when GitHub secrets are configured.

### **5. Start Development Server**

```bash
pnpm dev
# or
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🎯 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint

# Database (Supabase CLI)
pnpm db:validate      # check migration file names
pnpm db:start         # local stack (Docker)
pnpm db:reset         # apply migrations + seed
pnpm db:push          # apply pending migrations to linked remote
pnpm db:types:local   # TypeScript types from local DB
pnpm db:types         # TypeScript types from linked remote
```

## 🎨 Key Features Deep Dive

### **🏠 Premium Home Page**

- **Animated Hero Section** with gradient backgrounds and floating animations
- **Category Navigation** with pill-shaped buttons and smooth scrolling
- **Product Grid** with hover effects, wishlist, and quick view buttons
- **Smart Pagination** with page numbers and navigation controls
- **Loading States** with skeleton loaders
- **Empty States** with helpful messaging

### **🛒 Shopping Cart System**

- **Dual Mode Support**: Works for both guest and authenticated users
- **Session Persistence**: Guest carts persist across browser sessions
- **Real-time Updates**: Cart updates instantly across the application
- **Optimistic Updates**: UI updates immediately for better UX
- **Cart Migration**: Seamless transition from guest to authenticated user

### **🔐 Authentication Flow**

- **Email/Password Registration** with email confirmation
- **Secure Login/Logout** with session management
- **Protected Routes** with authentication guards
- **Guest User Support** with session-based functionality
- **Admin Dashboard** for product and order management

### **💳 Order Processing**

- **Stored Procedures** for atomic order creation
- **Inventory Management** with stock validation
- **Payment Integration** ready for Stripe/PayPal
- **Order Confirmation** with email notifications
- **Guest Order Tracking** with unique tokens

## 🗄️ Database Schema

### **Core Tables**

- **`users`** - User profiles and authentication
- **`products`** - Product catalog with variants
- **`categories`** - Product categorization
- **`cart_items`** - Shopping cart items
- **`orders`** - Order information
- **`order_items`** - Individual order line items
- **`payments`** - Payment records
- **`inventory`** - Stock management

### **Key Features**

- **Row Level Security (RLS)** for data protection
- **Foreign Key Constraints** for data integrity
- **Indexes** for optimal query performance
- **Enums** for consistent data types
- **Triggers** for automated operations

## 🎭 UI/UX Highlights

### **Design System**

- **Color Palette**: Indigo/Purple gradients with accent colors
- **Typography**: Clean hierarchy with proper font weights
- **Spacing**: Consistent padding and margins
- **Shadows**: Layered shadows for depth
- **Animations**: Smooth transitions and hover effects

### **Responsive Design**

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Grid System**: Responsive product grids
- **Touch Friendly**: Large touch targets for mobile

### **Accessibility**

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliant
- **Focus States**: Visible focus indicators

## 🚀 Performance Optimizations

### **Frontend**

- **Code Splitting**: Lazy loading of routes
- **Image Optimization**: Lazy loading and proper sizing
- **Query Caching**: TanStack Query for efficient data fetching
- **Bundle Optimization**: Vite for fast builds
- **Tree Shaking**: Unused code elimination

### **Backend**

- **Database Indexes**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching**: Query result caching
- **Edge Functions**: Serverless operations

## 🔧 Configuration

### **Tailwind CSS**

Custom configuration with:

- Extended color palette
- Custom animations
- Component variants
- Responsive utilities

### **TypeScript**

Strict configuration with:

- Path mapping for clean imports
- Strict type checking
- Modern ES features
- React-specific types

### **ESLint**

Code quality with:

- React hooks rules
- TypeScript integration
- Import organization
- Code formatting

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the lightning-fast build tool
- **React** team for the excellent framework

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using React, TypeScript, and Supabase**
