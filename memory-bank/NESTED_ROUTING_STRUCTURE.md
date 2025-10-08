# Nested Routing Structure with useRoutes 🛣️

Your footwear ecommerce project now uses a modern, declarative nested routing structure with React Router's `useRoutes` hook!

## 📁 **Clean File Structure:**

```
src/routes/
├── AppRoutes.tsx           # Main routes component using useRoutes
├── paths.ts               # Path constants for consistent routing
├── guards/                # Route guard components
│   ├── AuthGuard.tsx      # Requires authentication
│   ├── AdminGuard.tsx     # Requires admin privileges
│   ├── GuestGuard.tsx     # Redirects if authenticated
│   └── index.ts           # Guard exports
├── groups/                # Modular route groups
│   ├── publicRoutes.tsx   # Public routes (no auth needed)
│   ├── guestRoutes.tsx    # Guest-only routes
│   ├── protectedRoutes.tsx # Protected routes
│   ├── adminRoutes.tsx    # Admin routes
│   └── index.ts           # Group exports
└── index.tsx              # Main exports
```

## 🎯 **Key Features:**

### **1. Declarative Route Configuration**

```tsx
const routes = useRoutes([
  {
    path: "",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      // Public routes
      ...publicRoutes,

      // Guest routes (redirect if authenticated)
      guestRoutes(),

      // Protected routes (require authentication)
      protectedRoutes(),

      // Admin routes (require admin privileges)
      adminRoutes(),

      // 404 route
      { path: "*", element: <PageNotFound /> },
    ],
  },
]);
```

### **2. Path Constants**

```tsx
export const APP_PATHS = {
  home: "/",
  products: "/products",
  productDetail: (id: string) => `/products/${id}`,
  cart: "/cart",
  login: "/login",
  register: "/register",
  checkout: "/checkout",
  dashboard: "/dashboard",
  admin: "/admin",
  notFound: "*",
} as const;
```

### **3. Route Guards with Outlet**

```tsx
const AuthGuard = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />; // Renders child routes
};
```

### **4. Modular Route Groups**

```tsx
// Public routes (no guards)
export const publicRoutes = [
  { path: APP_PATHS.home, element: <Home /> },
  { path: APP_PATHS.products, element: <Products /> },
  { path: APP_PATHS.cart, element: <Cart /> },
];

// Protected routes (with guard)
export const protectedRoutes = () => ({
  path: "",
  element: <AuthGuard />,
  children: [
    { path: APP_PATHS.checkout, element: <Checkout /> },
    { path: APP_PATHS.dashboard, element: <Dashboard /> },
  ],
});
```

## 🚀 **Benefits:**

### **1. Declarative & Readable**

- Routes are defined as objects, not JSX
- Clear separation of concerns
- Easy to understand route hierarchy

### **2. Modular & Scalable**

- Route groups can be easily added/removed
- Each route type has its own file
- Simple to add new route categories

### **3. Type Safe**

- Path constants prevent typos
- TypeScript support throughout
- Compile-time route validation

### **4. Guard-Based Protection**

- Clean guard components using `Outlet`
- Reusable protection logic
- Clear authentication flow

### **5. Nested Routing**

- Proper route hierarchy
- Layout components work seamlessly
- Child routes inherit parent context

## 📝 **How to Add New Routes:**

### **Adding a Public Route:**

```tsx
// In src/routes/groups/publicRoutes.tsx
export const publicRoutes = [
  // ... existing routes
  { path: APP_PATHS.about, element: <About /> },
  { path: APP_PATHS.contact, element: <Contact /> },
];
```

### **Adding a Protected Route:**

```tsx
// In src/routes/groups/protectedRoutes.tsx
export const protectedRoutes = () => ({
  path: "",
  element: <AuthGuard />,
  children: [
    // ... existing routes
    { path: APP_PATHS.profile, element: <Profile /> },
    { path: APP_PATHS.orders, element: <Orders /> },
  ],
});
```

### **Adding an Admin Route:**

```tsx
// In src/routes/groups/adminRoutes.tsx
export const adminRoutes = () => ({
  path: APP_PATHS.admin,
  element: <AdminGuard />,
  children: [
    // ... existing routes
    { path: "users", element: <UserManagement /> },
    { path: "analytics", element: <Analytics /> },
  ],
});
```

### **Adding a New Route Category:**

```tsx
// 1. Create src/routes/groups/vendorRoutes.tsx
export const vendorRoutes = () => ({
  path: APP_PATHS.vendor,
  element: <VendorGuard />,
  children: [
    { path: '', element: <VendorDashboard /> },
    { path: 'products', element: <VendorProducts /> },
  ],
});

// 2. Add to AppRoutes.tsx
import { vendorRoutes } from "./groups/vendorRoutes";

// In useRoutes array:
vendorRoutes(),
```

## 🎨 **Route Flow:**

```
Layout (with Outlet)
├── Public Routes (no guard)
│   ├── / → Home
│   ├── /products → Products
│   └── /cart → Cart
├── Guest Routes (GuestGuard)
│   ├── /login → Login
│   └── /register → Register
├── Protected Routes (AuthGuard)
│   ├── /checkout → Checkout
│   └── /dashboard → Dashboard
├── Admin Routes (AdminGuard)
│   ├── /admin → AdminDashboard
│   └── /admin/dashboard → AdminDashboard
└── 404 Route
    └── * → PageNotFound
```

## 🔧 **Migration Benefits:**

- **Before**: 68 lines in App.tsx with mixed concerns
- **After**: Clean, declarative route configuration
- **Modularity**: Easy to add/remove route categories
- **Type Safety**: Path constants and TypeScript throughout
- **Maintainability**: Clear separation of route types
- **Scalability**: Simple to extend with new features

Your routing is now modern, scalable, and follows React Router best practices! 🎉
