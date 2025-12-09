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

        // Protected routes (require authentication)
        ...protectedRoutes,
      ],
    },
    // Admin routes with their own layout (no main site navigation)
    ...adminRoutes,
    // Guest routes (redirect if authenticated)
    ...guestRoutes,
  ]);
  return routes;
};

export default AppRoutes;
