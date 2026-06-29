import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/currency";
import { getOrderCustomerName } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import { useAdminDashboard } from "@/services/admin";
import {
  ArrowRight,
  DollarSign,
  Package,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-950",
  confirmed: "bg-sky-100 text-sky-950",
  processing: "bg-blue-100 text-blue-950",
  shipped: "bg-violet-100 text-violet-950",
  delivered: "bg-emerald-100 text-emerald-950",
  cancelled: "bg-red-100 text-red-950",
  refunded: "bg-zinc-200 text-zinc-900",
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

const AdminDashboardPage = () => {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Live overview of your store from Supabase.
        </p>
      </div>

      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-destructive">
              Could not load dashboard:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(data?.total_orders ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(data?.total_revenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Excludes cancelled & refunded
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.total_products ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Published catalog</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(data?.total_customers ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered profiles
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !data?.recent_orders?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No orders yet.
              </p>
            ) : (
              <div className="space-y-4">
                {(data?.recent_orders ?? []).map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-1 py-1 -mx-1 hover:border-border hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getOrderCustomerName(order)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.order_number}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {formatPrice(order.total_amount ?? 0)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "mt-0.5 capitalize text-[10px] font-medium",
                          statusColors[order.status ?? "pending"],
                        )}
                      >
                        {order.status ?? "pending"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Button asChild variant="outline" className="w-full mt-4">
              <Link to="/admin/orders">
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low stock variants</span>
                  <span className="text-sm font-medium text-amber-600">
                    {data?.inventory?.low_stock_count ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Out of stock</span>
                  <span className="text-sm font-medium text-red-600">
                    {data?.inventory?.out_of_stock_count ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tracked variants</span>
                  <span className="text-sm font-medium">
                    {data?.inventory?.tracked_variants ?? 0}
                  </span>
                </div>
              </div>
            )}
            <Button asChild variant="outline" className="w-full mt-4">
              <Link to="/admin/inventory">
                Manage Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
