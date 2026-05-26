import { lazy } from "react";
import HomePage from "@/pages/home-page";
import { APP_PATHS } from "../constants/app-paths";

// HomePage is eager — it is the LCP route, lazy-loading it would delay FCP.
// All other public pages are lazy-loaded to keep the initial JS bundle small.
const ProductsPage = lazy(() => import("@/pages/products-page"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail-page"));
const CheckoutPage = lazy(() => import("@/pages/checkout-page"));
const OrderConfirmationPage = lazy(() => import("@/pages/order-confirmation-page"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));
const { PaymentPage, ShippingPage, SupportPage, TrackingPage } = {
  PaymentPage: lazy(() =>
    import("@/pages/shop-help-pages").then((m) => ({ default: m.PaymentPage }))
  ),
  ShippingPage: lazy(() =>
    import("@/pages/shop-help-pages").then((m) => ({ default: m.ShippingPage }))
  ),
  SupportPage: lazy(() =>
    import("@/pages/shop-help-pages").then((m) => ({ default: m.SupportPage }))
  ),
  TrackingPage: lazy(() =>
    import("@/pages/shop-help-pages").then((m) => ({ default: m.TrackingPage }))
  ),
};

export const publicRoutes = [
  { path: APP_PATHS.home, element: <HomePage /> },
  { path: APP_PATHS.products, element: <ProductsPage /> },
  { path: APP_PATHS.productDetail(":id"), element: <ProductDetailPage /> },
  { path: APP_PATHS.checkout, element: <CheckoutPage /> },
  { path: APP_PATHS.orderConfirmation, element: <OrderConfirmationPage /> },
  { path: APP_PATHS.about, element: <AboutPage /> },
  { path: APP_PATHS.terms, element: <TermsPage /> },
  { path: APP_PATHS.support, element: <SupportPage /> },
  { path: APP_PATHS.shipping, element: <ShippingPage /> },
  { path: APP_PATHS.payment, element: <PaymentPage /> },
  { path: APP_PATHS.tracking, element: <TrackingPage /> },
  { path: APP_PATHS.notFound, element: <NotFoundPage /> },
];
