// Path constants for consistent routing
export const APP_PATHS = {
  // Public paths
  home: "/",
  products: "/products",
  productDetail: (id: string) => `/products/${id}`,
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  emailConfirmation: "/email-confirmation",
  checkout: "/checkout",
  orderConfirmation: "/order-confirmation",
  dashboard: "/dashboard",
  terms: "/terms",

  // Admin paths
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminProducts: "/admin/products",
  adminUsers: "/admin/users",
  adminOrders: "/admin/orders",

  // Error paths
  notFound: "*",
  error: "/error",
} as const;

// Type for path values
export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS];
