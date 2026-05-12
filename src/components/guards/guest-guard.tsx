import { APP_PATHS } from "@/constants/app-paths";
import { useAuth } from "@/contexts/auth-context";
import { useSession } from "@/services/auth/use-auth-query";
import { Navigate, Outlet } from "react-router-dom";

const GuestGuard = () => {
  const { user, isLoading: sessionLoading } = useSession();
  const { isAdmin } = useAuth();

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  if (user) {
    return <Navigate to={APP_PATHS.dashboard} replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
