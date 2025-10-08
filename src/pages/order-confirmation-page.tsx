import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetchOrderWithGuestToken } from "@/services/order/use-order-mutation";
import { CheckCircleIcon, HomeIcon, PackageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    orderNumber: string;
    guestToken?: string;
  } | null>(null);
  const [fullOrderData, setFullOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderMutation = useFetchOrderWithGuestToken(
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
    if (orderDetails?.orderId) {
      setLoading(true);
      fetchOrderMutation.mutate(undefined, {
        onSuccess: (data) => {
          setFullOrderData(data);
          setLoading(false);
        },
        onError: (error) => {
          console.error("Failed to fetch order details:", error);
          setLoading(false);
        },
      });
    }
  }, [orderDetails?.orderId, orderDetails?.guestToken]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the order details. Please check your email for
            order confirmation.
          </p>
          <Link to="/">
            <Button variant="gradient" size="lg">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. We've received your order and will
              process it shortly.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PackageIcon className="w-5 h-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold">{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-sm">{orderDetails.orderId}</p>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    Loading order details...
                  </p>
                </div>
              )}

              {fullOrderData && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-semibold">
                        ${fullOrderData.total_amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold capitalize">
                        {fullOrderData.status || "Pending"}
                      </p>
                    </div>
                  </div>

                  {fullOrderData.order_items &&
                    fullOrderData.order_items.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {fullOrderData.order_items.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <div>
                                  <p className="font-medium">
                                    {item.product_name}
                                  </p>
                                  {item.variant_name && (
                                    <p className="text-sm text-gray-500">
                                      {item.variant_name}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  ${item.total_price?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">What's Next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• We'll process your order within 1-2 business days</li>
                  <li>
                    • You'll get tracking information once your order ships
                  </li>
                  <li>
                    • For any questions, contact us with your order number
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                <HomeIcon className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Track Your Order
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our customer service team at{" "}
              <a
                href="mailto:support@footwear.com"
                className="text-primary-600 hover:underline"
              >
                support@footwear.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
