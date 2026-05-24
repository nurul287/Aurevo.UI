import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_PATHS } from "@/constants/app-paths";
import { formatPrice } from "@/lib/currency";
import { getLeadImageUrl } from "@/lib/product-images";
import { trackMetaPixelPurchase } from "@/lib/meta-pixel";
import { useFetchOrderWithGuestToken } from "@/services/order/use-order-query";
import {
  CheckCircle2,
  Home,
  Mail,
  Package,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

/** Set to true when order tracking is integrated. */
const ENABLE_ORDER_TRACKING = false;

const SUPPORT_EMAIL = "aurevofashion88@gmail.com";

function statusStyles(status: string | undefined) {
  const s = (status || "pending").toLowerCase();
  if (s === "delivered") return "bg-emerald-100 text-emerald-800 ring-emerald-600/20";
  if (s === "shipped") return "bg-violet-100 text-violet-800 ring-violet-600/20";
  if (s === "cancelled" || s === "refunded") return "bg-red-100 text-red-800 ring-red-600/20";
  if (s === "processing" || s === "confirmed") return "bg-sky-100 text-sky-800 ring-sky-600/20";
  return "bg-amber-100 text-amber-900 ring-amber-600/15";
}

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    orderNumber: string;
    guestToken?: string;
  } | null>(null);
  const [fullOrderData, setFullOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const purchaseTrackedOrderId = useRef<string | null>(null);

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useFetchOrderWithGuestToken(
    orderDetails?.orderId || "",
    orderDetails?.guestToken
  );

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const orderNumber = searchParams.get("orderNumber");
    const guestToken = searchParams.get("guestToken");

    if (orderId && orderNumber) {
      setOrderDetails({
        orderId,
        orderNumber,
        guestToken: guestToken || undefined,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (orderData) {
      setFullOrderData(orderData);
      setLoading(false);

      if (purchaseTrackedOrderId.current !== orderData.id) {
        purchaseTrackedOrderId.current = orderData.id;

        const items =
          (
            orderData as {
              order_items?: Array<{
                variant_id?: string;
                product_id?: string;
                quantity?: number;
              }>;
            }
          ).order_items ?? [];
        const contentIds = items
          .map((item) => item.variant_id ?? item.product_id)
          .filter((id): id is string => Boolean(id));

        trackMetaPixelPurchase({
          orderId: orderData.id,
          value: Number(orderData.total_amount) || 0,
          numItems: items.reduce(
            (sum: number, item: { quantity?: number }) =>
              sum + (item.quantity ?? 1),
            0,
          ),
          contentIds,
        });
      }
    } else if (orderError) {
      console.error("Failed to fetch order details:", orderError);
      setLoading(false);
    } else if (orderLoading) {
      setLoading(true);
    }
  }, [orderData, orderError, orderLoading]);

  const orderItems = fullOrderData?.order_items ?? [];

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-16 px-4">
        <div className="mx-auto w-full max-w-sm sm:max-w-md text-center px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
              Order not found
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              We could not load this confirmation link. Check your email for the
              correct link, or contact us with your order number.
            </p>
            <Button asChild className="mt-8 w-full rounded-full" size="lg">
              <Link to={APP_PATHS.home}>Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8 sm:py-10 px-4">
      <div className="mx-auto w-full max-w-sm sm:max-w-md">
        {/* Success */}
        <header className="text-center mb-5 sm:mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-500/10">
            <CheckCircle2
              className="h-7 w-7 text-emerald-600"
              strokeWidth={1.75}
            />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Thank you
          </p>
          <h1 className="mt-0.5 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Order confirmed
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto leading-snug">
            We have received your order and will prepare it for shipment. You
            will hear from us by email.
          </p>
        </header>

        {/* Receipt card */}
        <Card className="overflow-hidden border border-gray-200/80 bg-white shadow-sm rounded-xl">
          <CardContent className="p-0">
            <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Order number
                  </p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-gray-900 tracking-tight break-all">
                    {orderDetails.orderNumber}
                  </p>
                  <p className="mt-1.5 text-[10px] leading-snug text-gray-400 font-mono break-all">
                    Ref. {orderDetails.orderId}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${statusStyles(fullOrderData?.status)}`}
                >
                  {fullOrderData?.status || "Pending"}
                </span>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-5">
              {loading && (
                <div className="flex flex-col items-center justify-center py-6">
                  <div
                    className="h-7 w-7 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin"
                    aria-hidden
                  />
                  <p className="mt-3 text-xs text-gray-500">
                    Loading order details…
                  </p>
                </div>
              )}

              {fullOrderData && !loading && (
                <div className="space-y-4">
                  {orderItems.length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Items
                      </h2>
                      <ul className="space-y-1.5">
                        {orderItems.map((item: any, index: number) => {
                          const imageUrl = getLeadImageUrl(
                            item.product?.images,
                          );
                          return (
                          <li
                            key={item.id ?? index}
                            className="flex gap-2.5 rounded-lg border border-gray-100 bg-[#FDFCFA] px-2.5 py-2"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border border-gray-100">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.product_name || "Product"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-[#E1680B]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm leading-snug">
                                {item.product_name}
                              </p>
                              {item.variant_name && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.variant_name}
                                </p>
                              )}
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Qty {item.quantity}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 self-start">
                              {formatPrice(item.total_price)}
                            </p>
                          </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {(fullOrderData.subtotal != null ||
                    fullOrderData.shipping_amount != null) && (
                    <dl className="space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                      {fullOrderData.subtotal != null && (
                        <div className="flex justify-between gap-4 text-gray-600">
                          <dt>Subtotal</dt>
                          <dd className="font-medium text-gray-900 tabular-nums shrink-0">
                            {formatPrice(fullOrderData.subtotal)}
                          </dd>
                        </div>
                      )}
                      {fullOrderData.shipping_amount != null && (
                        <div className="flex justify-between gap-4 text-gray-600">
                          <dt>Shipping</dt>
                          <dd className="font-medium text-gray-900 tabular-nums shrink-0">
                            {formatPrice(fullOrderData.shipping_amount)}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-4 border-t border-gray-100 pt-2 text-sm">
                        <dt className="font-semibold text-gray-900">Total</dt>
                        <dd className="font-semibold text-gray-900 tabular-nums shrink-0">
                          {formatPrice(fullOrderData.total_amount)}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {fullOrderData.subtotal == null &&
                    fullOrderData.shipping_amount == null && (
                      <div className="flex justify-between items-baseline gap-4 border-t border-gray-100 pt-3">
                        <span className="text-sm text-gray-500">Total paid</span>
                        <span className="text-lg font-semibold tabular-nums text-gray-900 shrink-0">
                          {formatPrice(fullOrderData.total_amount)}
                        </span>
                      </div>
                    )}
                </div>
              )}

              <div className="mt-3 rounded-lg bg-gray-50/90 border border-gray-100 px-3 py-3 sm:px-3.5 sm:py-3.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Sparkles className="h-3.5 w-3.5 text-[#E1680B] shrink-0" />
                  What happens next
                </div>
                <ol className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-600 list-decimal list-inside leading-snug">
                  <li>We will send a confirmation to your email if you provided one.</li>
                  <li>We usually prepare orders within 1–2 business days.</li>
                  <li>We will contact you when your parcel is dispatched.</li>
                  <li>
                    Questions? Email us with your{" "}
                    <span className="font-medium text-gray-800">
                      order number
                    </span>
                    .
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <Button
            asChild
            size="default"
            className="h-10 rounded-full px-6 bg-gray-900 hover:bg-gray-800 text-white w-auto min-w-[10rem]"
          >
            <Link
              to={APP_PATHS.products}
              className="inline-flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4 shrink-0" />
              Continue shopping
            </Link>
          </Button>
          {ENABLE_ORDER_TRACKING && (
            <Button
              variant="outline"
              size="default"
              type="button"
              className="h-10 rounded-full px-6 border-gray-300 w-auto"
            >
              Track your order
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
          Need help?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-1 font-medium text-gray-900 underline-offset-4 hover:underline"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
