import { lazy } from "react";
import AuthGuard from "@/components/guards/auth-guard";
import { APP_PATHS } from "../constants/app-paths";

const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const DashboardProfilePage = lazy(() => import("@/pages/dashboard-profile-page"));

export const protectedRoutes = [
  {
    path: "",
    element: <AuthGuard />,
    children: [
      { path: APP_PATHS.dashboard, element: <DashboardPage /> },
      { path: APP_PATHS.dashboardProfile, element: <DashboardProfilePage /> },
    ],
  },
];
