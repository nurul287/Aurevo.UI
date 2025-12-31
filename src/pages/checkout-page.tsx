import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropDownList,
  DropDownListOption,
} from "@/components/ui/dropdown-list";
import { APP_PATHS } from "@/constants/app-paths";
import { useGuestCart } from "@/contexts/guest-cart-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useCreateGuestOrder } from "@/services/order/use-order-mutation";
import { CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useProduct } from "@/services";
import { useQuery } from "@tanstack/react-query";
import bkashLogo from "@/assets/image/bkash.png";

const SHIPPING_COST = 80; // Fixed shipping cost for all areas

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
  const checkoutSubtotal = useMemo(() => {
    if (directCheckoutItem) {
      const price =
        directCheckoutItem.variant?.price ||
        directCheckoutItem.product?.base_price ||
        0;
      return price * directCheckoutItem.quantity;
    }
    return cartTotal;
  }, [directCheckoutItem, cartTotal]);

  // Calculate totals
  const itemCount = checkoutItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const discountAmount = 0; // Will be calculated when coupon is applied
  const checkoutTotal = checkoutSubtotal + SHIPPING_COST - discountAmount;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    district: "",
    upazila: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch districts
  const { data: districtsData } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await fetch("https://bdapis.com/api/v1.2/districts");
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  // Convert districts to DropDownList options
  const districtOptions: DropDownListOption[] = useMemo(() => {
    if (!districtsData) return [];
    return districtsData.map((district: any) => ({
      value: district.district,
      label: district.district,
    }));
  }, [districtsData]);

  // Fetch upazilas when district is selected
  const { data: upazilasData } = useQuery({
    queryKey: ["upazilas", formData.district],
    queryFn: async () => {
      if (!formData.district) return [];
      const response = await fetch(
        `https://bdapis.com/api/v1.2/district/${encodeURIComponent(
          formData.district
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch upazilas");
      const data = await response.json();
      // API returns: { data: [{ district: "...", upazillas: [...] }] }
      // Extract the upazillas array from the first district object
      const districtData = data.data?.[0];
      if (districtData && districtData.upazillas) {
        return districtData.upazillas; // Array of strings
      }
      return [];
    },
    enabled: !!formData.district,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.phone ||
        !formData.address ||
        !formData.district ||
        !formData.upazila
      ) {
        showWarning(
          "Required fields missing",
          "Name, phone number, address, district, and upazila are required"
        );
        setIsSubmitting(false);
        return;
      }

      // Use email if provided, otherwise generate a temporary one
      const email = formData.email || `guest_${Date.now()}@example.com`;

      // Extract first and last name from name field
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Create guest order
      console.log("🛒 Creating guest order...");
      const orderResult = await createGuestOrderMutation.mutateAsync({
        email: email,
        phone: formData.phone,
        firstName: firstName,
        lastName: lastName,
        billingAddress: {
          firstName: firstName,
          lastName: lastName,
          address: formData.address,
          phone: formData.phone,
          district: formData.district,
          upazila: formData.upazila,
        },
        shippingAddress: {
          firstName: firstName,
          lastName: lastName,
          address: formData.address,
          phone: formData.phone,
          district: formData.district,
          upazila: formData.upazila,
        },
        items: checkoutItems.map((item) => ({
          product_id: item.product?.id || "",
          variant_id: item.variant?.id,
          quantity: item.quantity || 1,
          unit_price: item.variant?.price || item.product?.base_price || 0,
        })),
        subtotal: checkoutSubtotal,
        tax_amount: 0,
        shipping_amount: SHIPPING_COST,
        discount_amount: discountAmount,
        total_amount: checkoutTotal,
        payment_method: paymentMethod,
        notes: "",
        session_id: sessionId!,
      });

      console.log(
        "✅ Order created successfully:",
        orderResult.order.order_number
      );

      // Clear the cart after successful order (only if not direct checkout)
      if (!directCheckoutItem) {
      try {
        await clearCart();
      } catch (cartError) {
          console.warn("⚠️ Failed to clear cart:", cartError);
        }
      }

      // Redirect to order confirmation
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

  // Show error if direct checkout product failed to load
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
      <div className="container-custom max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.home}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="sticky top-8 bg-white">
                <CardContent className="pt-6">
                  {/* Product List */}
                  <div className="space-y-3 mb-6">
                    {checkoutItems.map((item, index) => {
                      const productImage =
                        item.product?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100";
                      const productName = item.product?.name || "Product";
                      const size = item.variant?.size || "N/A";
                      const color = item.variant?.color || "N/A";
                      const quantity = item.quantity || 1;
                      const unitPrice =
                        item.variant?.price || item.product?.base_price || 0;
                      const itemTotal = unitPrice * quantity;
                      const itemId =
                        "id" in item ? item.id : `direct-checkout-${index}`;

                      return (
                        <div key={itemId} className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold">
                              {quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {productName}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {size} / {color}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              ৳{formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
              </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Subtotal ({itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"})
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ৳{formatPrice(checkoutSubtotal)}
              </span>
            </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shipping</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ৳{formatPrice(SHIPPING_COST)}
                      </span>
              </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Discount</span>
                        <span className="text-sm font-semibold text-green-600">
                          -৳{formatPrice(discountAmount)}
              </span>
            </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-base font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        <span className="text-xs text-gray-600 mr-1">BDT</span>৳
                        {formatPrice(checkoutTotal)}
              </span>
            </div>
          </div>
                </CardContent>
              </Card>
        </div>

            {/* Right Column - Form Sections */}
            <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
              {/* Delivery Address Section */}
            <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Your delivery address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        required
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        required
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email (Optional)
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium text-gray-700"
                      >
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                        placeholder="Address"
                      required
                        className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                      <Label
                        htmlFor="district"
                        className="text-sm font-medium text-gray-700"
                      >
                        District <span className="text-red-500">*</span>
                      </Label>
                      <DropDownList
                        options={districtOptions}
                        value={formData.district}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            district: value,
                            upazila: "",
                          }))
                        }
                        placeholder="Select District"
                        searchPlaceholder="Filter"
                        emptyMessage="No districts found"
                      className="mt-1"
                    />
                  </div>
                  <div>
                      <Label
                        htmlFor="upazila"
                        className="text-sm font-medium text-gray-700"
                      >
                        Upazilla <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.upazila}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, upazila: value }))
                        }
                        disabled={!formData.district}
                      >
                        <SelectTrigger className="mt-1 border-gray-300">
                          <SelectValue placeholder="Select Upazila" />
                        </SelectTrigger>
                        <SelectContent>
                          {upazilasData?.map((upazila: string) => (
                            <SelectItem key={upazila} value={upazila}>
                              {upazila}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
              </CardContent>
            </Card>

              {/* Shipping Section */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Shipping Method
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Delivery Charge
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ৳{formatPrice(SHIPPING_COST)}
                      </span>
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Payment Method Section */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment method
                  </h2>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <div className="flex items-center space-x-3">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label
                        htmlFor="cash"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                          Cash On Delivery
                      </Label>
                      </div>
                      {paymentMethod === "cash" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </RadioGroup>

                  {/* Delivery Charge Advance Payment Note */}
                  {paymentMethod === "cash" && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        নোট: আপনাকে ডেলিভারি চার্জ অ্যাডভান্স পাঠাতে হবে নিচের
                        নাম্বারে
                      </p>
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm font-medium text-green-800">
                          01897918383
                        </span>
                        <img src={bkashLogo} alt="bKash" className="h-6" />
                  </div>
                </div>
                  )}
              </CardContent>
            </Card>

              {/* Order Now Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-medium"
              >
                {isSubmitting ? "Processing..." : "Order Now"}
              </Button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
