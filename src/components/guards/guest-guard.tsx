import { useAuth } from "@/contexts/auth-context";
import { Navigate, Outlet } from "react-router-dom";

const GuestGuard = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  } else if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
