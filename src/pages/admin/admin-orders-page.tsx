import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  useBulkUpdateOrderStatus,
  useCancelOrder,
  useUpdateFulfillmentStatus,
  useUpdateOrderNotes,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/services/order/use-order-mutation";
import { useOrders, useOrderStats } from "@/services/order/use-order-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  FulfillmentStatus,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/services/types";
import {
  CheckSquare,
  Filter,
  MoreHorizontal,
  Search,
  Square,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/** Badge uses `variant="outline"` so Tailwind colors stay on hover (default Badge uses primary hover). */
const statusColors = {
  pending:
    "border-transparent bg-amber-100 text-amber-950 hover:bg-amber-100 hover:text-amber-950",
  confirmed:
    "border-transparent bg-sky-100 text-sky-950 hover:bg-sky-100 hover:text-sky-950",
  processing:
    "border-transparent bg-blue-100 text-blue-950 hover:bg-blue-100 hover:text-blue-950",
  shipped:
    "border-transparent bg-violet-100 text-violet-950 hover:bg-violet-100 hover:text-violet-950",
  delivered:
    "border-transparent bg-emerald-100 text-emerald-950 hover:bg-emerald-100 hover:text-emerald-950",
  cancelled:
    "border-transparent bg-red-100 text-red-950 hover:bg-red-100 hover:text-red-950",
  refunded:
    "border-transparent bg-zinc-200 text-zinc-900 hover:bg-zinc-200 hover:text-zinc-900",
};

const paymentStatusColors = {
  paid: "border-transparent bg-emerald-100 text-emerald-950 hover:bg-emerald-100 hover:text-emerald-950",
  pending:
    "border-transparent bg-amber-100 text-amber-950 hover:bg-amber-100 hover:text-amber-950",
  failed: "border-transparent bg-red-100 text-red-950 hover:bg-red-100 hover:text-red-950",
  refunded:
    "border-transparent bg-zinc-200 text-zinc-900 hover:bg-zinc-200 hover:text-zinc-900",
  partially_refunded:
    "border-transparent bg-orange-100 text-orange-950 hover:bg-orange-100 hover:text-orange-950",
};

const fulfillmentStatusColors = {
  unfulfilled:
    "border-transparent bg-slate-200 text-slate-950 hover:bg-slate-200 hover:text-slate-950",
  partial:
    "border-transparent bg-orange-100 text-orange-950 hover:bg-orange-100 hover:text-orange-950",
  fulfilled:
    "border-transparent bg-emerald-100 text-emerald-950 hover:bg-emerald-100 hover:text-emerald-950",
};

type OrderItemRow = {
  id?: string;
  sku?: string | null;
  product_name?: string;
  variant_name?: string | null;
  quantity?: number;
  variant?: { sku?: string | null } | null;
};

type OrderRow = Order & {
  user?: { first_name?: string; last_name?: string } | null;
  order_items?: OrderItemRow[] | { count: number }[];
};

function getOrderLineItems(order: OrderRow): OrderItemRow[] {
  const raw = order.order_items;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0] as Record<string, unknown>;
  if ("count" in first && typeof first.count === "number") return [];
  return raw as OrderItemRow[];
}

function lineItemSku(it: OrderItemRow): string {
  const fromRow = (it.sku || "").trim();
  if (fromRow) return fromRow;
  const fromVariant = (it.variant?.sku || "").trim();
  if (fromVariant) return fromVariant;
  return "—";
}

function getCustomerPhone(order: Order): string | undefined {
  const top = order.phone?.trim();
  if (top) return top;
  const addr = order.shipping_address;
  if (addr && typeof addr === "object") {
    const a = addr as Record<string, unknown>;
    const p = String(a.phone ?? "").trim();
    if (p) return p;
  }
  const bill = order.billing_address;
  if (bill && typeof bill === "object") {
    const b = bill as Record<string, unknown>;
    const p = String(b.phone ?? "").trim();
    if (p) return p;
  }
  return undefined;
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  // Dialog states
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFulfillmentDialogOpen, setIsFulfillmentDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form states
  const [statusForm, setStatusForm] = useState({
    status: "" as OrderStatus,
    internalNotes: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: "" as PaymentStatus,
    internalNotes: "",
  });
  const [fulfillmentForm, setFulfillmentForm] = useState({
    fulfillmentStatus: "" as FulfillmentStatus,
    trackingNumber: "",
    estimatedDeliveryDate: "",
    internalNotes: "",
  });
  const [notesForm, setNotesForm] = useState({
    notes: "",
    internalNotes: "",
  });

  const {} = useToast();

  // API hooks
  const { data: ordersResponse, isLoading } = useOrders({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
  });
  const { data: stats, isLoading: statsLoading } = useOrderStats();

  // Mutation hooks
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();
  const updateFulfillmentStatusMutation = useUpdateFulfillmentStatus();
  const updateOrderNotesMutation = useUpdateOrderNotes();
  const bulkUpdateOrderStatusMutation = useBulkUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  const filteredOrders = ordersResponse?.data ?? [];
  const totalPages = ordersResponse?.totalPages ?? 1;
  const totalCount = ordersResponse?.count ?? 0;

  // Handle order selection
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setPaymentStatusFilter(value);
    setCurrentPage(1);
  };

  // Dialog handlers
  const openStatusDialog = (order: Order) => {
    setEditingOrder(order);
    setStatusForm({
      status: order.status || "pending",
      internalNotes: "",
    });
    setIsStatusDialogOpen(true);
  };

  const openPaymentDialog = (order: Order) => {
    setEditingOrder(order);
    setPaymentForm({
      paymentStatus: order.payment_status || "pending",
      internalNotes: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const openFulfillmentDialog = (order: Order) => {
    setEditingOrder(order);
    setFulfillmentForm({
      fulfillmentStatus: order.fulfillment_status || "unfulfilled",
      trackingNumber: order.tracking_number || "",
      estimatedDeliveryDate: order.estimated_delivery_date || "",
      internalNotes: "",
    });
    setIsFulfillmentDialogOpen(true);
  };

  const openNotesDialog = (order: Order) => {
    setEditingOrder(order);
    setNotesForm({
      notes: order.notes || "",
      internalNotes: order.internal_notes || "",
    });
    setIsNotesDialogOpen(true);
  };

  // Form submission handlers
  const handleUpdateStatus = () => {
    if (!editingOrder) return;

    updateOrderStatusMutation.mutate({
      orderId: editingOrder.id,
      status: statusForm.status,
      internalNotes: statusForm.internalNotes,
    });
    setIsStatusDialogOpen(false);
  };

  const handleUpdatePaymentStatus = () => {
    if (!editingOrder) return;

    updatePaymentStatusMutation.mutate({
      orderId: editingOrder.id,
      paymentStatus: paymentForm.paymentStatus,
      internalNotes: paymentForm.internalNotes,
    });
    setIsPaymentDialogOpen(false);
  };

  const handleUpdateFulfillmentStatus = () => {
    if (!editingOrder) return;

    updateFulfillmentStatusMutation.mutate({
      orderId: editingOrder.id,
      fulfillmentStatus: fulfillmentForm.fulfillmentStatus,
      trackingNumber: fulfillmentForm.trackingNumber,
      estimatedDeliveryDate: fulfillmentForm.estimatedDeliveryDate,
      internalNotes: fulfillmentForm.internalNotes,
    });
    setIsFulfillmentDialogOpen(false);
  };

  const handleUpdateNotes = () => {
    if (!editingOrder) return;

    updateOrderNotesMutation.mutate({
      orderId: editingOrder.id,
      notes: notesForm.notes,
      internalNotes: notesForm.internalNotes,
    });
    setIsNotesDialogOpen(false);
  };

  const handleBulkStatusUpdate = (status: OrderStatus) => {
    if (selectedOrders.length === 0) return;

    bulkUpdateOrderStatusMutation.mutate({
      orderIds: selectedOrders,
      status,
      internalNotes: `Bulk update to ${status}`,
    });
    setSelectedOrders([]);
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrderMutation.mutate(orderId);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => formatPrice(amount);

  const getCustomerDisplayName = (order: OrderRow) => {
    if (order.user) {
      const n = `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim();
      if (n) return n;
    }
    const ship = order.shipping_address;
    if (ship && typeof ship === "object") {
      const s = ship as Record<string, string | undefined>;
      const fn = s.firstName || s.first_name;
      const ln = s.lastName || s.last_name;
      const combined = `${fn || ""} ${ln || ""}`.trim();
      if (combined) return combined;
    }
    const bill = order.billing_address;
    if (bill && typeof bill === "object") {
      const b = bill as Record<string, string | undefined>;
      const fn = b.firstName || b.first_name;
      const ln = b.lastName || b.last_name;
      const combined = `${fn || ""} ${ln || ""}`.trim();
      if (combined) return combined;
    }
    return "Guest";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Processing Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_revenue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, or order numbers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentStatusFilter}
              onValueChange={handlePaymentStatusFilterChange}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">
                  Partially Refunded
                </SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== "all" || paymentStatusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPaymentStatusFilter("all"); setCurrentPage(1); }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedOrders.length} order
                  {selectedOrders.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("processing")}
                >
                  Mark as Processing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("shipped")}
                >
                  Mark as Shipped
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("delivered")}
                >
                  Mark as Delivered
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("cancelled")}
                  className="text-red-600"
                >
                  Cancel Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] sticky left-0 z-10 bg-background">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllOrders}
                    >
                      {selectedOrders.length === filteredOrders.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">
                    Order
                  </TableHead>
                  <TableHead className="min-w-[168px] whitespace-nowrap">
                    Customer
                  </TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">
                    SKU
                  </TableHead>
                  <TableHead className="min-w-[100px] whitespace-nowrap">
                    Total
                  </TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">
                    Ordered
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Payment</TableHead>
                  <TableHead className="whitespace-nowrap">Fulfillment</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const row = order as OrderRow;
                    const lineItems = getOrderLineItems(row);
                    const phone = getCustomerPhone(order);
                    return (
                    <TableRow key={order.id}>
                      <TableCell className="sticky left-0 z-10 bg-background align-top">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectOrder(order.id)}
                        >
                          {selectedOrders.includes(order.id) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="align-top">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order.id)}
                          className="block text-left font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          {order.order_number}
                        </button>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1.5 max-w-[220px]">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Name
                            </p>
                            <p className="text-sm font-medium text-foreground leading-snug">
                              {getCustomerDisplayName(row)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Phone
                            </p>
                            <p className="text-xs text-foreground tabular-nums">
                              {phone || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        {lineItems.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <ul className="space-y-1 max-w-[200px]">
                            {lineItems.map((it, idx) => (
                              <li key={it.id || idx}>
                                <span className="font-mono text-xs text-foreground">
                                  {lineItemSku(it)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                      <TableCell className="align-top text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(order.created_at || "")}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium capitalize shadow-none",
                            statusColors[
                              (order.status || "pending") as keyof typeof statusColors
                            ] ||
                              "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900"
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium capitalize shadow-none",
                            paymentStatusColors[
                              (order.payment_status ||
                                "pending") as keyof typeof paymentStatusColors
                            ] ||
                              "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900"
                          )}
                        >
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium capitalize shadow-none",
                            fulfillmentStatusColors[
                              (order.fulfillment_status ||
                                "unfulfilled") as keyof typeof fulfillmentStatusColors
                            ] ||
                              "border-transparent bg-slate-200 text-slate-950 hover:bg-slate-200 hover:text-slate-950"
                          )}
                        >
                          {order.fulfillment_status || "unfulfilled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewOrder(order.id)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openStatusDialog(order)}
                            >
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openPaymentDialog(order)}
                            >
                              Update Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openFulfillmentDialog(order)}
                            >
                              Update Fulfillment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openNotesDialog(order)}
                            >
                              Edit Notes
                            </DropdownMenuItem>
                            {order.status !== "cancelled" &&
                              order.status !== "delivered" && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="text-red-600"
                                >
                                  Cancel Order
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} · {totalCount} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusForm.status}
                onValueChange={(value) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    status: value as OrderStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add internal notes..."
                value={statusForm.internalNotes}
                onChange={(e) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    internalNotes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending
                ? "Updating..."
                : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update the payment status for order {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={paymentForm.paymentStatus}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    paymentStatus: value as PaymentStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partially_refunded">
                    Partially Refunded
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add internal notes..."
                value={paymentForm.internalNotes}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    internalNotes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePaymentStatus}
              disabled={updatePaymentStatusMutation.isPending}
            >
              {updatePaymentStatusMutation.isPending
                ? "Updating..."
                : "Update Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fulfillment Status Update Dialog */}
      <Dialog
        open={isFulfillmentDialogOpen}
        onOpenChange={setIsFulfillmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Fulfillment Status</DialogTitle>
            <DialogDescription>
              Update the fulfillment status for order{" "}
              {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fulfillmentStatus">Fulfillment Status</Label>
              <Select
                value={fulfillmentForm.fulfillmentStatus}
                onValueChange={(value) =>
                  setFulfillmentForm((prev) => ({
                    ...prev,
                    fulfillmentStatus: value as FulfillmentStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fulfillment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                  <SelectItem value="partial">Partially Fulfilled</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                placeholder="Enter tracking number..."
                value={fulfillmentForm.trackingNumber}
                onChange={(e) =>
                  setFulfillmentForm((prev) => ({
                    ...prev,
                    trackingNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDeliveryDate">
                Estimated Delivery Date
              </Label>
              <Input
                id="estimatedDeliveryDate"
                type="date"
                value={fulfillmentForm.estimatedDeliveryDate}
                onChange={(e) =>
                  setFulfillmentForm((prev) => ({
                    ...prev,
                    estimatedDeliveryDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add internal notes..."
                value={fulfillmentForm.internalNotes}
                onChange={(e) =>
                  setFulfillmentForm((prev) => ({
                    ...prev,
                    internalNotes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFulfillmentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFulfillmentStatus}
              disabled={updateFulfillmentStatusMutation.isPending}
            >
              {updateFulfillmentStatusMutation.isPending
                ? "Updating..."
                : "Update Fulfillment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Update Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order Notes</DialogTitle>
            <DialogDescription>
              Edit notes for order {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Customer Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add customer notes..."
                value={notesForm.notes}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add internal notes..."
                value={notesForm.internalNotes}
                onChange={(e) =>
                  setNotesForm((prev) => ({
                    ...prev,
                    internalNotes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNotesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotes}
              disabled={updateOrderNotesMutation.isPending}
            >
              {updateOrderNotesMutation.isPending
                ? "Updating..."
                : "Update Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
