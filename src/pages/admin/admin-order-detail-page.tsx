import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useUpdateFulfillmentStatus,
  useUpdateOrderNotes,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/services/order/use-order-mutation";
import {
  useOrder,
  useOrderItems,
  useOrderPayments,
} from "@/services/order/use-order-query";
import {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/services/types";
import { ArrowLeft, CreditCard, Edit, Package, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  // Dialog states
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFulfillmentDialogOpen, setIsFulfillmentDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

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

  // API hooks
  const { data: order, isLoading: orderLoading } = useOrder(orderId || "");
  const { data: orderItems, isLoading: itemsLoading } = useOrderItems(
    orderId || ""
  );
  const { data: payments, isLoading: paymentsLoading } = useOrderPayments(
    orderId || ""
  );

  // Mutation hooks
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();
  const updateFulfillmentStatusMutation = useUpdateFulfillmentStatus();
  const updateOrderNotesMutation = useUpdateOrderNotes();

  // Dialog handlers
  const openStatusDialog = () => {
    if (!order) return;
    setStatusForm({
      status: order.status || "pending",
      internalNotes: "",
    });
    setIsStatusDialogOpen(true);
  };

  const openPaymentDialog = () => {
    if (!order) return;
    setPaymentForm({
      paymentStatus: order.payment_status || "pending",
      internalNotes: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const openFulfillmentDialog = () => {
    if (!order) return;
    setFulfillmentForm({
      fulfillmentStatus: order.fulfillment_status || "unfulfilled",
      trackingNumber: order.tracking_number || "",
      estimatedDeliveryDate: order.estimated_delivery_date || "",
      internalNotes: "",
    });
    setIsFulfillmentDialogOpen(true);
  };

  const openNotesDialog = () => {
    if (!order) return;
    setNotesForm({
      notes: order.notes || "",
      internalNotes: order.internal_notes || "",
    });
    setIsNotesDialogOpen(true);
  };

  // Form submission handlers
  const handleUpdateStatus = () => {
    if (!order) return;

    updateOrderStatusMutation.mutate({
      orderId: order.id,
      status: statusForm.status,
      internalNotes: statusForm.internalNotes,
    });
    setIsStatusDialogOpen(false);
  };

  const handleUpdatePaymentStatus = () => {
    if (!order) return;

    updatePaymentStatusMutation.mutate({
      orderId: order.id,
      paymentStatus: paymentForm.paymentStatus,
      internalNotes: paymentForm.internalNotes,
    });
    setIsPaymentDialogOpen(false);
  };

  const handleUpdateFulfillmentStatus = () => {
    if (!order) return;

    updateFulfillmentStatusMutation.mutate({
      orderId: order.id,
      fulfillmentStatus: fulfillmentForm.fulfillmentStatus,
      trackingNumber: fulfillmentForm.trackingNumber,
      estimatedDeliveryDate: fulfillmentForm.estimatedDeliveryDate,
      internalNotes: fulfillmentForm.internalNotes,
    });
    setIsFulfillmentDialogOpen(false);
  };

  const handleUpdateNotes = () => {
    if (!order) return;

    updateOrderNotesMutation.mutate({
      orderId: order.id,
      notes: notesForm.notes,
      internalNotes: notesForm.internalNotes,
    });
    setIsNotesDialogOpen(false);
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

  const getCustomerName = (order: any) => {
    if (order.user) {
      return `${order.user.first_name || ""} ${
        order.user.last_name || ""
      }`.trim();
    }
    return "Guest Customer";
  };

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.order_number}
            </h1>
            <p className="text-muted-foreground">
              Created on {formatDate(order.created_at || "")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openStatusDialog}>
            <Edit className="h-4 w-4 mr-2" />
            Update Status
          </Button>
          <Button variant="outline" size="sm" onClick={openPaymentDialog}>
            <CreditCard className="h-4 w-4 mr-2" />
            Update Payment
          </Button>
          <Button variant="outline" size="sm" onClick={openFulfillmentDialog}>
            <Truck className="h-4 w-4 mr-2" />
            Update Fulfillment
          </Button>
          <Button variant="outline" size="sm" onClick={openNotesDialog}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Notes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Status Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Order Status
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    statusColors[order.status as keyof typeof statusColors]
                  }
                >
                  {order.status}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payment Status
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    paymentStatusColors[
                      order.payment_status as keyof typeof paymentStatusColors
                    ]
                  }
                >
                  {order.payment_status}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fulfillment
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    fulfillmentStatusColors[
                      order.fulfillment_status as keyof typeof fulfillmentStatusColors
                    ]
                  }
                >
                  {order.fulfillment_status}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="text-center py-4">Loading items...</div>
              ) : orderItems && orderItems.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.product_name}
                              </div>
                              {item.product && (
                                <div className="text-sm text-muted-foreground">
                                  {item.product.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.variant_name || "Default"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.sku}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.total_price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No items found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          {payments && payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                payment.status === "succeeded"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(payment.created_at || "")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.tax_amount && order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {order.shipping_amount && order.shipping_amount > 0 && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping_amount)}</span>
                </div>
              )}
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{getCustomerName(order)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{order.email}</p>
              </div>
              {order.phone && (
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{order.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address ? (
                <div className="text-sm space-y-1">
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address1}</p>
                  {order.shipping_address.address2 && (
                    <p>{order.shipping_address.address2}</p>
                  )}
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No shipping address
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Tracking Number</Label>
                  <p className="text-sm font-mono">{order.tracking_number}</p>
                </div>
                {order.estimated_delivery_date && (
                  <div>
                    <Label className="text-sm font-medium">
                      Estimated Delivery
                    </Label>
                    <p className="text-sm">
                      {formatDate(order.estimated_delivery_date)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(order.notes || order.internal_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div>
                    <Label className="text-sm font-medium">
                      Customer Notes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {order.notes}
                    </p>
                  </div>
                )}
                {order.internal_notes && (
                  <div>
                    <Label className="text-sm font-medium">
                      Internal Notes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {order.internal_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {order.order_number}
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
              Update the payment status for order {order.order_number}
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
              Update the fulfillment status for order {order.order_number}
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
              Edit notes for order {order.order_number}
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
