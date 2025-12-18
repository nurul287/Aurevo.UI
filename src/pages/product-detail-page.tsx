import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useProduct } from "@/services";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ShoppingCart } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { APP_PATHS } from "@/constants/app-paths";
import NumberStepper from "@/components/NumberStepper";
import ProductVideoPlayer from "@/components/ProductVideoPlayer";

const defaultVideoUrl =
  "https://assets.adidas.com/videos/ar_1,w_480,c_fill,q_auto,f_auto/41a0e81b8f4d463caf6036b59517f1a2_d98c/Handball_Spezial_Shoes_Black_IE5897_video.mp4";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { showError, showWarning } = useToast();

  // Drag-to-scroll refs and state
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Image zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  const handleCheckout = async () => {
    // First add to cart, then navigate to checkout
    await handleAddToCart();
    if (selectedSize) {
      navigate(APP_PATHS.checkout);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-white">
        <div className="container-custom">
          <Skeleton className="h-6 w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images Skeleton */}
            <div>
              <Skeleton className="w-full h-96 rounded-lg mb-4" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            {/* Product Info Skeleton */}
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-6 w-32 mb-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-8 bg-white">
        <div className="container-custom">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error?.message ||
                "The product you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get unique sizes from variants
  const availableSizes = [
    ...new Set(product.variants?.map((v) => v.size).filter(Boolean) || []),
  ];

  const productImages = product.images || [];
  const mainImage =
    productImages[selectedImageIndex]?.url ||
    productImages[0]?.url ||
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600";
  const productCode = product.sku || product.id.slice(0, 6).toUpperCase();

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!thumbnailContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - thumbnailContainerRef.current.offsetLeft);
    setScrollLeft(thumbnailContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !thumbnailContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - thumbnailContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    thumbnailContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!thumbnailContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - thumbnailContainerRef.current.offsetLeft);
    setScrollLeft(thumbnailContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !thumbnailContainerRef.current) return;
    const x = e.touches[0].pageX - thumbnailContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    thumbnailContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Prevent click when dragging
  const handleThumbnailClick = (index: number, e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setSelectedImageIndex(index);
  };

  // Image zoom handlers
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleImageMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="container-custom">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.home}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.products}>Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Product Images */}
          <div>
            {/* Main Product Image */}
            <div
              ref={imageContainerRef}
              className="mb-4 relative overflow-hidden rounded-lg border border-gray-200 bg-white cursor-zoom-in group"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={handleImageMouseEnter}
              onMouseLeave={handleImageMouseLeave}
              onClick={handleImageClick}
            >
              <div className="relative w-full h-[500px] flex items-center justify-center">
                <img
                  key={selectedImageIndex}
                  src={mainImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
                    isZoomed ? "scale-[2.5]" : "scale-100"
                  }`}
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
              {/* Zoom indicator */}
              {!isZoomed && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Hover to zoom
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 0 && (
              <div className="relative">
                <div
                  ref={thumbnailContainerRef}
                  className={`flex gap-2 overflow-x-auto select-none px-2 py-3 ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <style>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {productImages.map((image, index) => (
                    <button
                      key={`thumbnail-${index}`}
                      onClick={(e) => handleThumbnailClick(index, e)}
                      type="button"
                      className={`flex-shrink-0 w-22 h-22 rounded-lg border-2 transition-all ${
                        isDragging ? "cursor-grabbing" : "cursor-pointer"
                      } ${
                        selectedImageIndex === index
                          ? "border-[#FF6600] ring-2 ring-[#FF6600] ring-offset-2"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`View image ${index + 1} of ${
                        productImages.length
                      }`}
                    >
                      <div className="w-full h-full overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-3">
            {/* Product Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {product.name}:
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description ||
                  product.short_description ||
                  "Premium quality product from our collection."}
              </p>
            </div>
            {/* Price */}
            <div className="text-base font-medium">
              {product.compare_at_price &&
              product.compare_at_price > product.base_price ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-500">
                      Tk{" "}
                      {product.compare_at_price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-gray-900">
                      Tk{" "}
                      {product.base_price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <span className="bg-black text-white px-3 py-1 rounded text-sm font-semibold">
                    SAVE{" "}
                    {Math.round(
                      ((product.compare_at_price - product.base_price) /
                        product.compare_at_price) *
                        100
                    )}
                    %
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Price:</span>
                  <span className="">
                    Tk{" "}
                    {product.base_price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                  </span>
                </div>
              )}
            </div>

            {/* Product Code */}
            <div className="text-base font-medium flex items-center gap-2">
              <span>Code:</span>
              <span className="font-normal">{productCode}</span>
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                {/* <label className="block text-base font-semibold mb-1">
                  Size
                </label> */}
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size || "")}
                      className={`w-11 h-10.5 flex items-center justify-center px-4 py-2 text-sm font-medium rounded transition-all cursor-pointer ${
                        selectedSize === size
                          ? "border-2 border-[#333333] bg-[#333333] text-white"
                          : "border border-[#ddd] hover:border-[#333333]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              {/* <label className="block text-gray-900 font-semibold mb-1">
                Quantity
              </label> */}
              <NumberStepper
                value={quantity}
                onChange={(_e, newValue) => {
                  setQuantity(newValue);
                }}
                maxValue={99}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <Button
                onClick={handleCheckout}
                disabled={!selectedSize || isAddingToCart}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-11 font-medium rounded-md flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-5 h-5 text-white" />
                <span className="text-white">Check Out</span>
              </Button>

              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || isAddingToCart}
                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 h-11 font-medium rounded-md flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add Cart
              </Button>
            </div>

            {/* Product Video */}
            <div className="mt-2">
              <ProductVideoPlayer
                videoUrl={(product as any)?.video_url || defaultVideoUrl}
                posterImage={productImages[0]?.url}
                alt={`${product.name} video`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
