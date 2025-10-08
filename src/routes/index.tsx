import Layout from "@/components/layout";
import { useRoutes } from "react-router-dom";
import { adminRoutes } from "./admin-routes";
import { guestRoutes } from "./guest-routes";
import { protectedRoutes } from "./protected-routes";
import { publicRoutes } from "./public-routes";

const AppRoutes = () => {
  const routes = useRoutes([
    {
      path: "",
      element: <Layout />,
      children: [
        // Public routes (no guards needed)
        ...publicRoutes,

        // Guest routes (redirect if authenticated)
        ...guestRoutes,

        // Protected routes (require authentication)
        ...protectedRoutes,

        // Admin routes (require admin privileges)
        ...adminRoutes,
      ],
    },
  ]);
  return routes;
};

export default AppRoutes;
