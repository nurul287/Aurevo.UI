import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useProduct } from "@/services";
import { useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { showError, showWarning } = useToast();

  const { data: product, isLoading, error } = useProduct(id || "");
  const { addItem, isAddingToCart } = useCart();

  // Set default selections when product loads
  if (
    product &&
    product.variants &&
    product.variants.length > 0 &&
    !selectedSize
  ) {
    const firstVariant = product.variants[0];
    setSelectedSize(firstVariant.size || "");
    setSelectedColor(firstVariant.color || "");
  }

  const handleAddToCart = async () => {
    if (!product) {
      showError("Product not loaded", "Please refresh the page and try again");
      return;
    }

    if (!selectedSize) {
      showWarning(
        "Size required",
        "Please select a size before adding to cart"
      );
      return;
    }

    try {
      // Find the variant that matches the selected size and color
      const variant = product.variants?.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );

      if (!variant) {
        showWarning(
          "Variant not available",
          "Selected variant is not available"
        );
        return;
      }

      // Use the unified cart hook (works for both logged-in and guest users)
      await addItem(product.id, variant.id, quantity);

      // Success toast is handled by the cart hook
    } catch (error) {
      console.error("Add to cart error:", error);
      showError(
        "Failed to add item to cart",
        "Something went wrong. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images Skeleton */}
            <div>
              <Skeleton className="w-full h-96 rounded-lg mb-4" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="w-full h-24 rounded-lg" />
                <Skeleton className="w-full h-24 rounded-lg" />
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/4 mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-20 w-full mb-8" />

              {/* Size Selection Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-6 w-12 mb-3" />
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>

              {/* Color Selection Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-6 w-16 mb-3" />
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20" />
                  ))}
                </div>
              </div>

              {/* Quantity Skeleton */}
              <div className="mb-8">
                <Skeleton className="h-6 w-20 mb-3" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>

              {/* Buttons Skeleton */}
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error?.message ||
                  "The product you're looking for doesn't exist."}
              </p>
              <Button asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get unique sizes and colors from variants
  const availableSizes = [
    ...new Set(product.variants?.map((v) => v.size).filter(Boolean) || []),
  ];
  const availableColors = [
    ...new Set(product.variants?.map((v) => v.color).filter(Boolean) || []),
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <Card>
            <CardContent className="p-6">
              <img
                src={
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600"
                }
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              <div className="grid grid-cols-2 gap-2">
                {product.images?.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{product.brand?.name}</Badge>
                    {product.category && (
                      <Badge variant="outline">{product.category.name}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">
                    ${product.base_price}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.compare_at_price}
                    </span>
                  )}
                </div>

                <Separator />

                <p className="text-muted-foreground">{product.description}</p>

                {/* Size Selection */}
                {availableSizes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Size</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {availableSizes.map((size) => (
                        <Button
                          key={size}
                          variant={
                            selectedSize === size ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedSize(size || "")}
                          className="h-12"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {availableColors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Color</h3>
                    <div className="flex gap-3">
                      {availableColors.map((color) => (
                        <Button
                          key={color}
                          variant={
                            selectedColor === color ? "default" : "outline"
                          }
                          onClick={() => setSelectedColor(color || "")}
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="addToCart"
                    size="lg"
                    className="w-full"
                    disabled={!selectedSize || !user || isAddingToCart}
                  >
                    {!user
                      ? "Please log in to add to cart"
                      : isAddingToCart
                      ? "Adding to Cart..."
                      : "Add to Cart"}
                  </Button>

                  <Button variant="gradient" size="lg" className="w-full">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Add to Wishlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
