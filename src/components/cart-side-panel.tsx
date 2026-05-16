import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { useGuestCart } from "@/contexts/guest-cart-context";
import { useProduct } from "@/services";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ShoppingCart, Trash2, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "@/constants/app-paths";
import NumberStepper from "@/components/NumberStepper";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";
import { getLeadImageUrl } from "@/lib/product-images";
import { getUniqueSizesFromVariants } from "@/lib/variant-size-sort";

const CartSidePanel = () => {
  const { isCartPanelOpen, closeCartPanel } = useGuestCart();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const {
    cartItems,
    cartTotal,
    updateItemQuantity,
    removeItem,
    addItem,
    isUpdatingQuantity,
    isRemovingItem,
  } = useCart();

  // Track which item is being updated (for loading state)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [updatingSizeItemId, setUpdatingSizeItemId] = useState<string | null>(
    null
  );

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }
    setUpdatingItemId(itemId);
    try {
      await updateItemQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleSizeChange = async (
    item: any,
    _newSize: string,
    newVariantId: string
  ) => {
    setUpdatingSizeItemId(item.id!);
    try {
      // Remove old item and add new item with new variant
      await removeItem(item.id!);
      // Add the new variant with the same quantity (suppress the "Added to cart" toast)
      await addItem(item.product_id, newVariantId, item.quantity, true);
      // Show custom success toast for size update
      const productName = item.product?.name || "Item";
      showSuccess("Size updated", `${productName} size has been updated`);
    } catch (error) {
      showError("Failed to update size", "Please try again");
    } finally {
      setUpdatingSizeItemId(null);
    }
  };

  const handleCheckout = () => {
    closeCartPanel();
    navigate(APP_PATHS.checkout);
  };


  return (
    <Sheet open={isCartPanelOpen} onOpenChange={closeCartPanel}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-white [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-gray-200 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg font-semibold text-gray-900">
                Shopping Cart
              </SheetTitle>
              {cartItems.length > 0 && (
                <span className="text-sm text-gray-600">
                  ({cartItems.length}{" "}
                  {cartItems.length === 1 ? "item" : "items"})
                </span>
              )}
            </div>
            {/* Custom Close Button */}
            <SheetClose className="absolute top-4 right-6 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer">
              <X className="h-5 w-5 font-semibold stroke-[2]" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 relative">
          {/* Global Loading Overlay - Centered in Side Panel */}
          {(isUpdatingQuantity ||
            updatingItemId !== null ||
            updatingSizeItemId !== null) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <div className="w-8 h-8 border-[3px] border-gray-400 border-t-gray-800 rounded-full animate-spin" />
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any items yet.
              </p>
              <Button
                onClick={closeCartPanel}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => {
                const product = item.product;
                const variant = item.variant;
                const productImage =
                  getLeadImageUrl(product?.images) ||
                  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100";
                const productName = product?.name || "Product";
                const size = variant?.size || "N/A";
                const variantPrice = variant?.price || product?.base_price || 0;
                const compareAtPrice =
                  variant?.compare_at_price || product?.compare_at_price;
                const hasDiscount =
                  compareAtPrice && compareAtPrice > variantPrice;

                const isItemUpdating =
                  updatingItemId === item.id || updatingSizeItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`border-b border-gray-300 pb-6 last:border-b-0 ${
                      isItemUpdating ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={productImage}
                          alt={productName}
                          className={`w-22 h-22 object-cover rounded-lg border border-gray-200 ${
                            isItemUpdating ? "opacity-50" : ""
                          }`}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-gray-900 text-sm mb-1 line-clamp-2 ${
                            isItemUpdating ? "opacity-50" : ""
                          }`}
                        >
                          {productName}
                        </h3>
                        {variant?.name && (
                          <p
                            className={`text-xs text-gray-600 mb-1 ${
                              isItemUpdating ? "opacity-50" : ""
                            }`}
                          >
                            {variant.name}
                          </p>
                        )}

                        {/* Price Display */}
                        <div
                          className={`mb-2 ${
                            isItemUpdating ? "opacity-50" : ""
                          }`}
                        >
                          {hasDiscount ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <span className="line-through text-gray-500 text-sm">
                                  {formatPrice(compareAtPrice!)}
                                </span>
                                <span className="text-gray-900 font-semibold text-sm">
                                  {formatPrice(variantPrice)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-900 font-semibold text-sm">
                              {formatPrice(variantPrice)}
                            </span>
                          )}
                        </div>

                        {/* Size and Quantity Row */}
                        <div className="flex items-center gap-3">
                          {/* Size Selection */}
                          {product && (
                            <CartItemSizeSelector
                              productId={product.id}
                              currentSize={size}
                              currentVariantId={item.variant_id}
                              onSizeChange={(newSize, newVariantId) =>
                                handleSizeChange(item, newSize, newVariantId)
                              }
                              disabled={isItemUpdating}
                            />
                          )}

                          {/* Quantity Selector */}
                          <div className="flex-1">
                            <NumberStepper
                              width="100px"
                              height="30px"
                              value={item.quantity}
                              onChange={(_e, newValue) =>
                                handleUpdateQuantity(item.id!, newValue)
                              }
                              maxValue={99}
                              disabled={
                                isUpdatingQuantity ||
                                isRemovingItem ||
                                isItemUpdating
                              }
                            />
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id!)}
                            disabled={isRemovingItem || isItemUpdating}
                            className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 p-1 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <SheetFooter className="flex-col gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-semibold text-gray-900">
                Subtotal:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <div className="w-full">
              <Button
                onClick={handleCheckout}
                disabled={
                  isUpdatingQuantity ||
                  isRemovingItem ||
                  updatingItemId !== null ||
                  updatingSizeItemId !== null
                }
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBagIcon className="w-5 h-5 text-white" />
                CHECK OUT
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Component to handle size selection for a cart item
function CartItemSizeSelector({
  productId,
  currentSize,
  currentVariantId,
  onSizeChange,
  disabled = false,
}: {
  productId: string;
  currentSize: string;
  currentVariantId: string;
  onSizeChange: (size: string, variantId: string) => void;
  disabled?: boolean;
}) {
  const { data: product } = useProduct(productId);
  const [isOpen, setIsOpen] = useState(false);

  if (!product || !product.variants || product.variants.length === 0) {
    return null;
  }

  const availableSizes = getUniqueSizesFromVariants(product.variants);

  if (availableSizes.length <= 1) {
    return (
      <div className="text-xs text-gray-600">
        Size: <span className="font-medium">{currentSize}</span>
      </div>
    );
  }

  const handleSizeSelect = (size: string) => {
    const variant = product.variants?.find((v) => v.size === size);
    if (variant && variant.id !== currentVariantId) {
      onSizeChange(size, variant.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between gap-2 text-xs text-gray-700 border border-[#111111] transition-colors bg-white ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-gray-400 cursor-pointer"
        }`}
        style={{
          height: "30px",
          width: "80px",
          paddingLeft: "10px",
          paddingRight: "8px",
        }}
      >
        <span className="font-medium">{currentSize}</span>
        <ChevronDown className="w-3 h-3 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[80px] max-h-[200px] overflow-y-auto">
            {availableSizes.map((size) => {
              const variant = product.variants?.find((v) => v.size === size);
              const isSelected = variant?.id === currentVariantId;
              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size || "")}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                    isSelected
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default CartSidePanel;
