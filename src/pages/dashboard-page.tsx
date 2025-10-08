import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useUserOrders, useUserProfile } from "@/services";
import { Package, Settings, User } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();

  // Use TanStack Query hooks for user data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(user?.id);

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useUserOrders(user?.id || "");

  if (profileLoading || ordersLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom">
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome back, {profile?.first_name || user?.email || "User"}!
          </h2>
          <p className="text-gray-600">
            Manage your orders, profile, and account settings.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                {orders.length === 0 ? "No orders yet" : "All time orders"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Status
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile ? "Complete" : "Incomplete"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile ? "Profile is set up" : "Complete your profile"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading orders</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">
                  Start shopping to see your orders here.
                </p>
                <Button asChild>
                  <a href="/products">Start Shopping</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total_amount}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">View All Orders</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profileError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error loading profile</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {user?.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {profile.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Additional Info</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {profile.gender || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Date of Birth:</span>{" "}
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span>{" "}
                      {profile.preferences?.role || "user"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your personal information to get started.
                </p>
                <Button>Complete Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
