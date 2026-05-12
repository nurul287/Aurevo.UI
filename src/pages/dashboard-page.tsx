import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_PATHS } from "@/constants/app-paths";
import { useAuth } from "@/contexts/auth-context";
import { formatOrderShippingLine } from "@/lib/format-order-address";
import { getProfileCompletion } from "@/lib/profile-completion";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useUserOrders, useUserProfile } from "@/services";
import type { Order, OrderItem } from "@/services/types";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Loader2,
  Package,
  Pencil,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

type OrderWithItems = Order & { order_items?: OrderItem[] };

function orderItemsSummary(order: OrderWithItems): string {
  const items = order.order_items;
  if (!items?.length) return "—";
  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const first = items[0]?.product_name?.trim() || "Item";
  const extra = items.length > 1 ? ` · +${items.length - 1} more` : "";
  return `${totalQty} item${totalQty === 1 ? "" : "s"} · ${first}${extra}`;
}

function statusBadgeClass(status: string | undefined) {
  const s = (status || "pending").toLowerCase();
  if (s === "delivered")
    return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
  if (s === "shipped" || s === "processing" || s === "confirmed")
    return "bg-sky-50 text-sky-800 border-sky-200/80";
  if (s === "cancelled" || s === "refunded")
    return "bg-red-50 text-red-800 border-red-200/80";
  return "bg-amber-50 text-amber-900 border-amber-200/80";
}

const DashboardPage = () => {
  const { user } = useAuth();

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

  const completion = getProfileCompletion(profile);
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email?.split("@")[0] ||
    "there";

  if (profileLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/25 pb-16 pt-10">
      <div className="container-custom max-w-6xl space-y-10">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Welcome back, {displayName}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Track orders, keep your details up to date, and pick up where you
            left off.
          </p>
        </header>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total orders
                </CardTitle>
                <p className="mt-3 text-3xl font-bold tabular-nums">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Package className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {orders.length === 0
                  ? "Your completed purchases will appear here."
                  : "All-time orders on this account."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Account status
                </CardTitle>
                <p className="mt-3 text-3xl font-bold text-emerald-600">Active</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-700">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Profile
                </CardTitle>
                <p
                  className={cn(
                    "mt-3 text-3xl font-bold",
                    completion.percent >= 100
                      ? "text-emerald-600"
                      : completion.percent >= 50
                        ? "text-amber-600"
                        : "text-muted-foreground",
                  )}
                >
                  {completion.percent}%
                </p>
              </div>
              <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-700">
                <Sparkles className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    completion.percent >= 100 ? "bg-emerald-500" : "bg-primary",
                  )}
                  style={{ width: `${completion.percent}%` }}
                />
              </div>
              <p className="text-xs font-medium text-foreground">
                {completion.headline}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {completion.detail}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent orders */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-col gap-1 border-b bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Recent orders</CardTitle>
              <CardDescription>
                Order number, delivery address, and current status.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to={APP_PATHS.products}>
                Shop again
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {ordersError ? (
              <div className="p-10 text-center">
                <p className="text-destructive mb-4">Could not load orders.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No orders yet</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  When you place an order while signed in, it will show up here
                  with shipping details and status.
                </p>
                <Button className="mt-6" asChild>
                  <Link to={APP_PATHS.products}>Browse products</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="whitespace-nowrap">Order</TableHead>
                        <TableHead className="whitespace-nowrap">Placed</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="max-w-[140px] lg:max-w-[180px]">
                          Ship to
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-right">
                          Total
                        </TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="w-[100px] text-right">
                          {""}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(orders as OrderWithItems[]).slice(0, 8).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="whitespace-nowrap font-mono text-sm font-medium">
                            {order.order_number || order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {orderItemsSummary(order)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div
                              className="max-w-[140px] truncate lg:max-w-[180px]"
                              title={formatOrderShippingLine(
                                order.shipping_address,
                              )}
                            >
                              {formatOrderShippingLine(
                                order.shipping_address,
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                            {formatPrice(order.total_amount, { decimals: 0 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-normal capitalize border",
                                statusBadgeClass(order.status),
                              )}
                            >
                              {order.status || "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                to={`${APP_PATHS.orderConfirmation}?orderId=${order.id}&orderNumber=${encodeURIComponent(order.order_number || "")}`}
                              >
                                View
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="divide-y md:hidden">
                  {(orders as OrderWithItems[]).slice(0, 8).map((order) => (
                    <div key={order.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold whitespace-nowrap">
                            {order.order_number || order.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 capitalize border font-normal",
                            statusBadgeClass(order.status),
                          )}
                        >
                          {order.status || "pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {orderItemsSummary(order)}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-3">
                        <span className="font-medium text-foreground/80">
                          Ship to:{" "}
                        </span>
                        {formatOrderShippingLine(order.shipping_address)}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="whitespace-nowrap text-base font-semibold tabular-nums">
                          {formatPrice(order.total_amount, { decimals: 0 })}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to={`${APP_PATHS.orderConfirmation}?orderId=${order.id}&orderNumber=${encodeURIComponent(order.order_number || "")}`}
                          >
                            Receipt
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Personal information */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Personal information</CardTitle>
              <CardDescription>
                Used for shipping labels and account notifications.
              </CardDescription>
            </div>
            <Button asChild className="shrink-0">
              <Link to={APP_PATHS.dashboardProfile}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit profile
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {profileError ? (
              <div className="py-10 text-center">
                <p className="text-destructive mb-4">Could not load profile.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            ) : profile ? (
              <div className="grid gap-8 md:grid-cols-2">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {[profile.first_name, profile.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm font-medium break-all">
                      {user?.email?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {profile.phone?.trim() || "—"}
                    </dd>
                  </div>
                </dl>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Gender
                    </dt>
                    <dd className="mt-1 text-sm font-medium capitalize">
                      {profile.gender?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Date of birth
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Set up your profile</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Add your name and contact details so checkout and support go
                  smoothly.
                </p>
                <Button className="mt-6" asChild>
                  <Link to={APP_PATHS.dashboardProfile}>Create profile</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
