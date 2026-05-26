import Layout from "@/components/layout";
import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { adminRoutes } from "./admin-routes";
import { guestRoutes } from "./guest-routes";
import { protectedRoutes } from "./protected-routes";
import { publicRoutes } from "./public-routes";

const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
  </div>
);

const AppRoutes = () => {
  const routes = useRoutes([
    {
      path: "",
      element: <Layout />,
      children: [
        ...publicRoutes,
        ...protectedRoutes,
      ],
    },
    ...adminRoutes,
    ...guestRoutes,
  ]);
  return <Suspense fallback={<PageFallback />}>{routes}</Suspense>;
};

export default AppRoutes;
