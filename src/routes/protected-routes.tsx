import AuthGuard from "@/components/guards/auth-guard";
import DashboardPage from "@/pages/dashboard-page";
import { APP_PATHS } from "../constants/app-paths";

export const protectedRoutes = [
  {
    path: "",
    element: <AuthGuard />,
    children: [{ path: APP_PATHS.dashboard, element: <DashboardPage /> }],
  },
];
