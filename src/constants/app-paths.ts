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
  dashboardProfile: "/dashboard/profile",
  dashboardAddresses: "/dashboard/addresses",
  about: "/about",
  terms: "/terms",
  support: "/support",
  shipping: "/shipping",
  payment: "/payment",
  tracking: "/tracking",

  // Admin paths
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminProducts: "/admin/products",
  adminUsers: "/admin/users",
  adminOrders: "/admin/orders",
  adminAi: "/admin/ai",

  // Error paths
  notFound: "*",
  error: "/error",
} as const;

// Type for path values
export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS];
