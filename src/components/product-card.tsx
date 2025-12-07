import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { HeartIcon, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess, showWarning } = useToast();

  const firstImage = product.images?.[0]?.url;
  const availableSizes = product.variants?.map((v: any) => v.size) || [
    "40",
    "41",
    "42",
    "43",
    "44",
  ];

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If no sizes available, use first variant or create without variant
    if (availableSizes.length === 0) {
      const firstVariant = product.variants?.[0];
      if (firstVariant) {
        await addItem(product.id, firstVariant.id, 1);
        showSuccess("Added to cart", `${product.name} added to cart`);
        navigate("/cart");
      } else {
        showWarning(
          "Product unavailable",
          "This product cannot be added to cart"
        );
      }
      return;
    }

    if (!selectedSize) {
      showWarning(
        "Please select a size",
        "Choose a size before adding to cart"
      );
      return;
    }

    // Find the variant with the selected size
    const variant = product.variants?.find((v: any) => v.size === selectedSize);

    if (variant) {
      await addItem(product.id, variant.id, 1);
      showSuccess(
        "Added to cart",
        `${product.name} (Size ${selectedSize}) added to cart`
      );
      navigate("/cart");
    }
  };

  return (
    <div className="group">
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full bg-[#FDF7F3] rounded-2xl">
        {/* Image Container */}
        <Link to={`/products/${product.id}`}>
          <div className="relative aspect-square bg-white overflow-hidden rounded-t-2xl">
            {firstImage ? (
              <img
                src={firstImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-120 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-6xl font-bold text-gray-300">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center hover:scale-110 transition-all z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <HeartIcon className="h-7 w-7 text-[#E1680B] fill-none stroke-2" />
            </button>

            {/* View Count Badge */}
            <Badge className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 text-xs font-semibold rounded">
              360 ৳ 48
            </Badge>
          </div>
        </Link>

        {/* Product Info */}
        <CardContent className="p-4 bg-[#FDF7F3] flex flex-col">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-medium text-lg text-gray-900 line-clamp-2 hover:text-gray-700 transition-colors mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-[#414141] rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">৳</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {product.base_price}
            </span>
          </div>

          {/* Sizes */}
          <div className="flex-grow min-h-[2rem] flex flex-col justify-end mb-3">
            {availableSizes.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Size</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {availableSizes.slice(0, 5).map((size: string) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSizeSelect(size);
                      }}
                      className={`px-2.5 py-1 text-sm font-medium transition-all border cursor-pointer ${
                        selectedSize === size
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No sizes available</div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-[120px] bg-[#FF6600] hover:bg-[#E65C00] text-white h-10 text-sm font-normal rounded"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4.5 w-4.5" strokeWidth={3} />
            Add Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
