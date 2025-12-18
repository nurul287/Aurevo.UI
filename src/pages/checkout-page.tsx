import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGuestCart } from "@/contexts/guest-cart-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useCreateGuestOrder } from "@/services/order/use-order-mutation";
import {
  CheckCircleIcon,
  CreditCardIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useProduct } from "@/services";

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const { cartItems, cartTotal, loading, clearCart } = useCart();
  const { sessionId } = useGuestCart();
  const navigate = useNavigate();
  const createGuestOrderMutation = useCreateGuestOrder();
  const { showError, showWarning } = useToast();

  // Check if this is a direct checkout (from product detail page)
  const directCheckoutProductId = searchParams.get("productId");
  const directCheckoutVariantId = searchParams.get("variantId");
  const directCheckoutQuantity = searchParams.get("quantity");

  // Fetch product data if direct checkout
  const { data: directCheckoutProduct, isLoading: isLoadingDirectProduct } =
    useProduct(directCheckoutProductId || "");

  // Create direct checkout item if params are present
  const directCheckoutItem = useMemo(() => {
    if (
      directCheckoutProductId &&
      directCheckoutVariantId &&
      directCheckoutQuantity &&
      directCheckoutProduct
    ) {
      const variant = directCheckoutProduct.variants?.find(
        (v) => v.id === directCheckoutVariantId
      );
      if (variant) {
        return {
          product: directCheckoutProduct,
          variant: variant,
          quantity: parseInt(directCheckoutQuantity, 10),
        };
      }
    }
    return null;
  }, [
    directCheckoutProductId,
    directCheckoutVariantId,
    directCheckoutQuantity,
    directCheckoutProduct,
  ]);

  // Use direct checkout item if available, otherwise use cart items
  const checkoutItems = directCheckoutItem ? [directCheckoutItem] : cartItems;
  const checkoutTotal = useMemo(() => {
    if (directCheckoutItem) {
      const price =
        directCheckoutItem.variant?.price ||
        directCheckoutItem.product?.base_price ||
        0;
      return price * directCheckoutItem.quantity;
    }
    return cartTotal;
  }, [directCheckoutItem, cartTotal]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    district: "",
    thana: "",
    address: "",
    orderNote: "",
    couponCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.phone || !formData.email) {
        showWarning(
          "Required fields missing",
          "First name, phone number, and email are required"
        );
        setIsSubmitting(false);
        return;
      }

      // Create guest order directly (no user account required)
      console.log("🛒 Creating guest order...");
      console.log("sessionId", sessionId);
      const orderResult = await createGuestOrderMutation.mutateAsync({
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          district: formData.district,
          thana: formData.thana,
          address: formData.address,
          phone: formData.phone,
        },
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          district: formData.district,
          thana: formData.thana,
          address: formData.address,
          phone: formData.phone,
        },
        items: checkoutItems.map((item) => ({
          product_id: item.product?.id || "",
          variant_id: item.variant?.id,
          quantity: item.quantity,
          unit_price: item.variant?.price || item.product?.base_price || 0,
        })),
        subtotal: checkoutTotal,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        total_amount: checkoutTotal,
        payment_method: paymentMethod,
        notes: formData.orderNote,
        session_id: sessionId!,
      });

      console.log(
        "✅ Order created successfully:",
        orderResult.order.order_number
      );

      // Clear the cart after successful order (only if not direct checkout)
      // For direct checkout, we don't need to clear cart since item wasn't added
      if (!directCheckoutItem) {
        try {
          console.log("🧹 Clearing cart after successful order...");
          await clearCart();
          console.log("✅ Cart cleared successfully from frontend");
        } catch (cartError) {
          console.warn("⚠️ Failed to clear cart from frontend:", cartError);
          // Don't fail the order if cart clearing fails
        }
      }

      // Redirect to order confirmation with order details and guest token if available
      const params = new URLSearchParams({
        orderId: orderResult.order.id,
        orderNumber: orderResult.order.order_number,
      });

      if (orderResult.guest_token) {
        params.append("guestToken", orderResult.guest_token);
      }

      navigate(`/order-confirmation?${params.toString()}`);
    } catch (error) {
      console.error("Checkout error:", error);
      showError(
        "Failed to process checkout",
        "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Show loading if cart is loading or direct checkout product is loading
  if (loading || (directCheckoutProductId && isLoadingDirectProduct)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show error if direct checkout product failed to load (after loading is complete)
  if (
    directCheckoutProductId &&
    !isLoadingDirectProduct &&
    !directCheckoutProduct
  ) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">
            The product you're trying to checkout is not available.
          </p>
          <Link to="/products">
            <Button variant="default" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Add some items to your cart before checkout.
          </p>
          <Link to="/products">
            <Button variant="default" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container-custom">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Shopping Cart
              </span>
            </div>
            <div className="w-16 h-1 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Checkout
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Order Complete
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Billing and Shipping Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Billing & Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="flex items-center">
                        <MailIcon className="w-4 h-4 mr-1" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        We'll use this email to send you order updates and
                        tracking information.
                      </p>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value: string) =>
                          setFormData((prev) => ({ ...prev, district: value }))
                        }
                        required
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dhaka">Dhaka</SelectItem>
                          <SelectItem value="chittagong">Chittagong</SelectItem>
                          <SelectItem value="sylhet">Sylhet</SelectItem>
                          <SelectItem value="rajshahi">Rajshahi</SelectItem>
                          <SelectItem value="khulna">Khulna</SelectItem>
                          <SelectItem value="barisal">Barisal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="thana">Thana *</Label>
                      <Select
                        value={formData.thana}
                        onValueChange={(value: string) =>
                          setFormData((prev) => ({ ...prev, thana: value }))
                        }
                        required
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dhanmondi">Dhanmondi</SelectItem>
                          <SelectItem value="gulshan">Gulshan</SelectItem>
                          <SelectItem value="banani">Banani</SelectItem>
                          <SelectItem value="uttara">Uttara</SelectItem>
                          <SelectItem value="mohammadpur">
                            Mohammadpur
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address Details"
                      required
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="orderNote">Order Note</Label>
                    <Textarea
                      id="orderNote"
                      name="orderNote"
                      value={formData.orderNote}
                      onChange={handleInputChange}
                      placeholder="Order Note"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <Label htmlFor="couponCode">Coupon Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="couponCode"
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleInputChange}
                        placeholder="Enter Coupon Code"
                        className="flex-1"
                      />
                      <Button type="button" variant="secondary" size="default">
                        Apply
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {checkoutItems.map((item, index) => (
                    <div
                      key={item.id || `direct-checkout-${index}`}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={
                          item.product?.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100"
                        }
                        alt={item.product?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {item.variant?.size} | Color:{" "}
                          {item.variant?.color}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        $
                        {(
                          (item.variant?.price ||
                            item.product?.base_price ||
                            0) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${checkoutTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${checkoutTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Payment Method</h4>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label
                        htmlFor="online"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <CreditCardIcon className="w-4 h-4" />
                        <span>Online Payment</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label
                        htmlFor="cash"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <TruckIcon className="w-4 h-4" />
                        <span>Cash on Delivery</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Terms and Conditions */}
                <div className="pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) =>
                        setAcceptTerms(checked === true)
                      }
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      I accept the{" "}
                      <Link
                        to="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms & Conditions
                      </Link>
                      ,{" "}
                      <Link
                        to="/return-policy"
                        className="text-blue-600 hover:underline"
                      >
                        Return & Refund Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!acceptTerms || isSubmitting}
                  variant="secondary"
                  size="lg"
                  className="w-full mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
