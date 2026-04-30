import CheckoutPage from "@/pages/checkout-page";
import HomePage from "@/pages/home-page";
import NotFoundPage from "@/pages/not-found-page";
import OrderConfirmationPage from "@/pages/order-confirmation-page";
import ProductDetailPage from "@/pages/product-detail-page";
import ProductsPage from "@/pages/products-page";
import TermsPage from "@/pages/terms-page";
import { APP_PATHS } from "../constants/app-paths";

export const publicRoutes = [
  { path: APP_PATHS.home, element: <HomePage /> },
  { path: APP_PATHS.products, element: <ProductsPage /> },
  { path: APP_PATHS.productDetail(":id"), element: <ProductDetailPage /> },
  { path: APP_PATHS.checkout, element: <CheckoutPage /> },
  { path: APP_PATHS.orderConfirmation, element: <OrderConfirmationPage /> },
  { path: APP_PATHS.terms, element: <TermsPage /> },
  // 404 route
  {
    path: APP_PATHS.notFound,
    element: <NotFoundPage />,
  },
];
