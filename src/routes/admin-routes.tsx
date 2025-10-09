import AdminBrandsPage from "@/pages/admin/admin-brands-page";
import AdminCategoriesPage from "@/pages/admin/admin-categories-page";
import AdminDashboardPage from "@/pages/admin/admin-dashboard-page";
import AdminImagesPage from "@/pages/admin/admin-images-page";
import AdminInventoryPage from "@/pages/admin/admin-inventory-page";
import AdminOrdersPage from "@/pages/admin/admin-orders-page";
import AdminProductsPage from "@/pages/admin/admin-products-page";
import AdminVariantsPage from "@/pages/admin/admin-variants-page";
import { AdminLayout } from "../components/admin/admin-layout";
import AdminGuard from "../components/guards/admin-guard";
import { APP_PATHS } from "../constants/app-paths";

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
          { path: "inventory", element: <AdminInventoryPage /> },
          { path: "inventory/products", element: <AdminProductsPage /> },
          // Add more admin routes here as needed
          // { path: 'analytics', element: <AdminAnalytics /> },
          // { path: 'users', element: <AdminUsers /> },
          // { path: 'settings', element: <AdminSettings /> },
        ],
      },
    ],
  },
];
