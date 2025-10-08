import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import {
  ArrowLeftIcon,
  Minus,
  Plus,
  ShoppingBagIcon,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    loading: cartLoading,
    error: cartError,
    updateItemQuantity,
    removeItem,
    isUpdatingQuantity,
    isRemovingItem,
  } = useCart();

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    await updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container-custom text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Cart</h1>
          <p className="text-gray-600 mb-8">
            {cartError.message || "Failed to load your cart. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100"
                      }
                      alt={item.product?.name || "Product"}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.product?.name || "Product Name"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Size: {item.variant?.size || "N/A"} | Color:{" "}
                        {item.variant?.color || "N/A"}
                      </p>
                      <p className="text-primary-600 font-bold">
                        ${item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleUpdateQuantity(item.id!, item.quantity - 1)
                        }
                        disabled={isUpdatingQuantity || isRemovingItem}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleUpdateQuantity(item.id!, item.quantity + 1)
                        }
                        disabled={isUpdatingQuantity || isRemovingItem}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id!)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isUpdatingQuantity || isRemovingItem}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cartTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Link to="/checkout">
                      <Button
                        variant="success"
                        className="w-full px-6 py-4"
                        size="xl"
                      >
                        <ShoppingBagIcon className="w-5 h-5 mr-3" />
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </div>
                  <div>
                    <Link to="/products">
                      <Button
                        variant="gradient"
                        className="w-full px-6 py-3"
                        size="lg"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
