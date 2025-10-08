import AdminDashboardPage from "@/pages/admin/admin-dashboard-page";
import AdminOrdersPage from "@/pages/admin/admin-orders-page";
import AdminProductsPage from "@/pages/admin/admin-products-page";
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
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "inventory/products", element: <AdminProductsPage /> },
          // Add more admin routes here as needed
          // { path: 'inventory/categories', element: <AdminCategories /> },
          // { path: 'inventory/stock', element: <AdminStock /> },
          // { path: 'analytics', element: <AdminAnalytics /> },
          // { path: 'users', element: <AdminUsers /> },
          // { path: 'settings', element: <AdminSettings /> },
        ],
      },
    ],
  },
];
