import AdminDashboardPage from "@/pages/admin/admin-dashboard-page";
import AdminGuard from "../components/guards/admin-guard";
import { APP_PATHS } from "../constants/app-paths";

export const adminRoutes = [
  {
    path: APP_PATHS.admin,
    element: <AdminGuard />,
    children: [
      { path: "", element: <AdminDashboardPage /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      // Add more admin routes here as needed
      // { path: 'products', element: <AdminProducts /> },
      // { path: 'users', element: <AdminUsers /> },
      // { path: 'orders', element: <AdminOrders /> },
    ],
  },
];
