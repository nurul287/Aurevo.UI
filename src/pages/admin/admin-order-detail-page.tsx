import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
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

type LooseAddr = Record<string, unknown>;

function addrStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Name from profile-linked user, or guest JSON on shipping/billing. */
function getCustomerDisplayName(order: {
  user?: { first_name?: string; last_name?: string } | null;
  shipping_address?: unknown;
  billing_address?: unknown;
}): string {
  if (order.user) {
    const n = `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim();
    if (n) return n;
  }
  const fromShip = nameFromAddressJson(order.shipping_address);
  if (fromShip) return fromShip;
  const fromBill = nameFromAddressJson(order.billing_address);
  if (fromBill) return fromBill;
  return "Guest checkout";
}

function nameFromAddressJson(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "";
  const a = addr as LooseAddr;
  const fn = addrStr(a.firstName || a.first_name);
  const ln = addrStr(a.lastName || a.last_name);
  const combined = `${fn} ${ln}`.trim();
  if (combined) return combined;
  return addrStr(a.name);
}

function phoneFromAddressJson(addr: unknown): string | undefined {
  if (!addr || typeof addr !== "object") return undefined;
  const p = addrStr((addr as LooseAddr).phone);
  return p || undefined;
}

function getCustomerPhoneDisplay(order: {
  phone?: string | null;
  shipping_address?: unknown;
  billing_address?: unknown;
}): string | undefined {
  const top = order.phone?.trim();
  if (top) return top;
  return (
    phoneFromAddressJson(order.shipping_address) ||
    phoneFromAddressJson(order.billing_address)
  );
}

/**
 * Renders shipping (or billing-style) JSON from checkout (BD) or legacy
 * street/city rows.
 */
/** Coerce Supabase decimal / string amounts for display. */
function toMoneyAmount(value: unknown): number {
  if (value == null) return 0;
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Legacy checkout placeholder; treat as no email for display. */
function isSyntheticGuestEmail(email: string | null | undefined): boolean {
  const e = email?.trim() ?? "";
  if (!e) return false;
  return /^guest_\d+@example\.com$/i.test(e);
}

function orderEmailForDisplay(email: string | null | undefined): string | null {
  const e = email?.trim() ?? "";
  if (!e || isSyntheticGuestEmail(e)) return null;
  return e;
}

/** When `shipping_amount` was not stored but `total_amount` includes it. */
function resolvedShippingDisplay(order: {
  subtotal?: unknown;
  tax_amount?: unknown;
  discount_amount?: unknown;
  shipping_amount?: unknown;
  total_amount?: unknown;
}): number {
  const sub = toMoneyAmount(order.subtotal);
  const tax = toMoneyAmount(order.tax_amount);
  const disc = toMoneyAmount(order.discount_amount);
  const ship = toMoneyAmount(order.shipping_amount);
  const total = toMoneyAmount(order.total_amount);
  if (ship > 0.005) return ship;
  const implied = total - sub - tax + disc;
  return implied > 0.005 ? implied : 0;
}

function linesFromAddressJson(addr: unknown): string[] {
  if (!addr || typeof addr !== "object") return [];
  const a = addr as LooseAddr;

  const street = addrStr(a.address || a.address1 || a.line1 || a.street);
  const upazila = addrStr(a.upazila || a.suburb);
  const district = addrStr(a.district);
  const city = addrStr(a.city);
  const state = addrStr(a.state || a.region);
  const postal = addrStr(a.postal_code || a.postalCode || a.zip);
  const country = addrStr(a.country);

  const lines: string[] = [];

  if (street) lines.push(street);

  const locality = [upazila, district].filter(Boolean).join(", ");
  if (locality) {
    lines.push(locality);
  } else if (city || state) {
    const tail = [city, state].filter(Boolean).join(", ");
    if (tail) lines.push(tail);
  }

  if (postal) lines.push(postal);
  if (country) lines.push(country);

  if (lines.length === 0) {
    const legacyName = addrStr(a.name);
    if (legacyName) lines.push(legacyName);
    const a2 = addrStr(a.address2);
    if (a2) lines.push(a2);
    const legacyCity = [city, state, postal].filter(Boolean).join(" ");
    if (legacyCity) lines.push(legacyCity);
    if (country && !lines.includes(country)) lines.push(country);
  }

  return lines.filter(Boolean);
}

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
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
  const { data: payments } = useOrderPayments(orderId || "");

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

  const customerEmailDisplay = orderEmailForDisplay(order.email);

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
                  variant="outline"
                  className={cn(
                    "border-transparent font-semibold capitalize",
                    statusColors[
                      order.status as keyof typeof statusColors
                    ] ?? "bg-gray-100 text-gray-800",
                  )}
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
                  variant="outline"
                  className={cn(
                    "border-transparent font-semibold capitalize",
                    paymentStatusColors[
                      order.payment_status as keyof typeof paymentStatusColors
                    ] ?? "bg-gray-100 text-gray-800",
                  )}
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
                  variant="outline"
                  className={cn(
                    "border-transparent font-semibold capitalize",
                    fulfillmentStatusColors[
                      order.fulfillment_status as keyof typeof fulfillmentStatusColors
                    ] ?? "bg-gray-100 text-gray-800",
                  )}
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
                            <div className="font-medium text-foreground">
                              {item.product_name?.trim() ||
                                item.product?.name ||
                                "—"}
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
                            {(() => {
                              const pAmt = toMoneyAmount(payment.amount);
                              const oTot = toMoneyAmount(order.total_amount);
                              const singleRow = payments.length === 1;
                              const legacyShort =
                                singleRow &&
                                oTot > pAmt + 0.01 &&
                                Math.abs(
                                  pAmt - toMoneyAmount(order.subtotal)
                                ) < 0.02;
                              const displayAmt = legacyShort ? oTot : pAmt;
                              return (
                                <div>
                                  <span className="font-medium tabular-nums">
                                    {formatCurrency(displayAmt)}
                                  </span>
                                  {legacyShort && (
                                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug max-w-[200px]">
                                      Stored payment row was{" "}
                                      {formatCurrency(pAmt)} (items only).
                                      Showing full order total.
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-transparent font-semibold capitalize",
                                payment.status === "succeeded"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : payment.status === "refunded"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800",
                              )}
                            >
                              {payment.status === "succeeded"
                                ? "paid"
                                : payment.status}
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
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product total</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(toMoneyAmount(order.subtotal))}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(resolvedShippingDisplay(order))}
                  </span>
                </div>
                {toMoneyAmount(order.shipping_amount) < 0.005 &&
                  resolvedShippingDisplay(order) > 0.005 && (
                    <p className="text-[10px] text-muted-foreground text-right leading-snug">
                      Inferred from order total (legacy row)
                    </p>
                  )}
              </div>
              {toMoneyAmount(order.tax_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(toMoneyAmount(order.tax_amount))}
                  </span>
                </div>
              )}
              {toMoneyAmount(order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium tabular-nums text-green-600">
                    −{formatCurrency(toMoneyAmount(order.discount_amount))}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between font-bold text-base">
                  <span>Order total</span>
                  <span className="tabular-nums">
                    {formatCurrency(toMoneyAmount(order.total_amount))}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Product total + shipping
                  {toMoneyAmount(order.tax_amount) > 0 ? " + tax" : ""}
                  {toMoneyAmount(order.discount_amount) > 0
                    ? " − discount"
                    : ""}
                  .
                </p>
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
                <p className="text-sm text-foreground">
                  {getCustomerDisplayName(order)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                {customerEmailDisplay ? (
                  <p className="text-sm break-all">{customerEmailDisplay}</p>
                ) : (
                  <p className="text-sm font-mono text-muted-foreground">null</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm tabular-nums">
                  {getCustomerPhoneDisplay(order) || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const lines = linesFromAddressJson(order.shipping_address);
                const shipPhone = phoneFromAddressJson(order.shipping_address);
                const customerPhone = getCustomerPhoneDisplay(order);
                const showExtraPhone =
                  Boolean(shipPhone) && shipPhone !== customerPhone;
                if (lines.length === 0 && !shipPhone) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      No shipping address on file.
                    </p>
                  );
                }
                return (
                  <div className="text-sm space-y-1.5 text-foreground">
                    {lines.map((line, i) => (
                      <p key={i} className="leading-snug">
                        {line}
                      </p>
                    ))}
                    {showExtraPhone && (
                      <p className="pt-1 text-muted-foreground tabular-nums">
                        <span className="font-medium text-foreground">
                          Phone:{" "}
                        </span>
                        {shipPhone}
                      </p>
                    )}
                  </div>
                );
              })()}
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
