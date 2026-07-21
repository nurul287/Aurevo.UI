import { lazy } from "react";
import { AdminLayout } from "../components/admin/admin-layout";
import AdminGuard from "../components/guards/admin-guard";
import { APP_PATHS } from "../constants/app-paths";

// All admin pages are lazy-loaded — they are never needed on the storefront.
const AdminDashboardPage = lazy(() => import("@/pages/admin/admin-dashboard-page"));
const AdminProductsPage = lazy(() => import("@/pages/admin/admin-products-page"));
const AdminVariantsPage = lazy(() => import("@/pages/admin/admin-variants-page"));
const AdminImagesPage = lazy(() => import("@/pages/admin/admin-images-page"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/admin-categories-page"));
const AdminBrandsPage = lazy(() => import("@/pages/admin/admin-brands-page"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/admin-orders-page"));
const AdminOrderDetailPage = lazy(() => import("@/pages/admin/admin-order-detail-page"));
const AdminInventoryPage = lazy(() => import("@/pages/admin/admin-inventory-page"));
const AdminAiMetricsPage = lazy(() => import("@/pages/admin/admin-ai-metrics-page"));

export const adminRoutes = [
  {
    path: APP_PATHS.admin,
    element: <AdminGuard />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          { path: "", element: <AdminDashboardPage /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "variants", element: <AdminVariantsPage /> },
          { path: "images", element: <AdminImagesPage /> },
          { path: "categories", element: <AdminCategoriesPage /> },
          { path: "brands", element: <AdminBrandsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "orders/:orderId", element: <AdminOrderDetailPage /> },
          { path: "inventory", element: <AdminInventoryPage /> },
          { path: "inventory/products", element: <AdminProductsPage /> },
          { path: "ai", element: <AdminAiMetricsPage /> },
        ],
      },
    ],
  },
];
