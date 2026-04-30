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
import {
  useBulkUpdateOrderStatus,
  useCancelOrder,
  useUpdateFulfillmentStatus,
  useUpdateOrderNotes,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/services/order/use-order-mutation";
import {
  useOrders,
  useOrderStats,
  useSearchOrders,
} from "@/services/order/use-order-query";
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
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Status color mappings
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  partially_refunded: "bg-orange-100 text-orange-800",
};

const fulfillmentStatusColors = {
  unfulfilled: "bg-gray-100 text-gray-800",
  partial: "bg-orange-100 text-orange-800",
  fulfilled: "bg-green-100 text-green-800",
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);

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
  const { data: ordersResponse, isLoading: ordersLoading } = useOrders({
    page: currentPage,
    limit: pageSize,
  });
  const { data: searchResponse, isLoading: searchLoading } = useSearchOrders(
    searchTerm,
    { page: currentPage, limit: pageSize }
  );
  const { data: stats, isLoading: statsLoading } = useOrderStats();

  // Mutation hooks
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();
  const updateFulfillmentStatusMutation = useUpdateFulfillmentStatus();
  const updateOrderNotesMutation = useUpdateOrderNotes();
  const bulkUpdateOrderStatusMutation = useBulkUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  // Extract orders from response
  const orders = useMemo(() => {
    if (searchTerm && searchTerm.length > 2) {
      return searchResponse?.data || [];
    }
    return ordersResponse?.data || [];
  }, [searchResponse, ordersResponse, searchTerm]);

  const isLoading = ordersLoading || searchLoading;

  // Filter orders based on status and payment status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        order.payment_status === paymentStatusFilter;

      return matchesStatus && matchesPaymentStatus;
    });
  }, [orders, statusFilter, paymentStatusFilter]);

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

  const getCustomerName = (order: Order & { user?: any }) => {
    if (order.user) {
      return `${order.user.first_name || ""} ${
        order.user.last_name || ""
      }`.trim();
    }
    return "Guest Customer";
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
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Processing Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingOrders}</div>
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
                {formatCurrency(stats.totalRevenue)}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              onValueChange={setPaymentStatusFilter}
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
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
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
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
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
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getCustomerName(order)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[
                              order.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            paymentStatusColors[
                              order.payment_status as keyof typeof paymentStatusColors
                            ]
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            fulfillmentStatusColors[
                              order.fulfillment_status as keyof typeof fulfillmentStatusColors
                            ]
                          }
                        >
                          {order.fulfillment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at || "")}
                      </TableCell>
                      <TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
