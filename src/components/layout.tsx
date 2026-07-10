import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/hooks/use-cart";
import { useGuestCart } from "@/contexts/guest-cart-context";
import CartSidePanel from "@/components/cart-side-panel";
import {
  Bars3Icon,
  ShoppingBagIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MessengerIcon from "@/assets/icon/messenger-icon";
import { useEffect, useRef, useState } from "react";
import { APP_PATHS } from "@/constants/app-paths";
import { useCategories } from "@/services";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HeaderProductSearch } from "@/components/header-product-search";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import AurevoBlack from "@/assets/icon/aurevo-black";
import AurevoWhite from "@/assets/icon/aurevo-white";

// Social Icons
import FacebookSquareIcon from "@/assets/icon/facebook-square-icon";
import InstagramIcon from "@/assets/icon/instagram-icon";
import TikTokIcon from "@/assets/icon/tiktok-icon";
import YoutubeIcon from "@/assets/icon/youtube-icon";

// Contact Icons
import LocationIcon from "@/assets/icon/location-icon";
import EmailIcon from "@/assets/icon/email-icon";
import PhoneIcon from "@/assets/icon/phone-icon";
import WhatsAppIcon from "@/assets/icon/whatsapp-icon";

// Payment Images
import bkashImg from "@/assets/image/bkash.png";
import nagadImg from "@/assets/image/nagad.png";
import visaImg from "@/assets/image/visa.png";
import masterCardImg from "@/assets/image/master-card.png";

const Layout = () => {
  const { t } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { openCartPanel } = useGuestCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: headerCategories = [] } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Menu toggle functions
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const closeUserMenu = () => setUserMenuOpen(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        closeUserMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isCategoryNavActive = (slug: string | undefined) => {
    if (!slug || location.pathname !== APP_PATHS.products) return false;
    const current = new URLSearchParams(location.search).get("category");
    return current?.toLowerCase() === slug.toLowerCase();
  };

  const categoryNavLinkClass = (slug: string) =>
    `inline-flex items-center text-sm xl:text-base font-semibold whitespace-nowrap transition-colors border px-2 py-1 rounded-none ${
      isCategoryNavActive(slug)
        ? "text-gray-900 border-[#111111]"
        : "text-gray-700 border-transparent hover:text-gray-900 hover:border-gray-300"
    }`;

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMobileMenu();
      closeUserMenu();
      // Force a page reload to ensure clean state
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`${APP_PATHS.products}?search=${encodeURIComponent(q)}`);
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center h-[80px] lg:h-[100px] justify-between">
            {/* Left side: Logo + Navigation */}
            <div className="flex items-center gap-4 lg:gap-12">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to={APP_PATHS.home}>
                  <AurevoBlack />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-2">
                {headerCategories.map((cat) =>
                  cat.slug ? (
                    <Link
                      key={cat.id}
                      to={`${APP_PATHS.products}?category=${encodeURIComponent(cat.slug)}`}
                      className={categoryNavLinkClass(cat.slug)}
                    >
                      {cat.name}
                    </Link>
                  ) : null,
                )}
              </nav>
            </div>

            {/* Right side: Search Bar + Icons + Sign In */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <HeaderProductSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmitSearch={handleSearchSubmit}
                formClassName="hidden lg:block"
                inputClassName="w-[200px] xl:w-[320px] h-[44px] rounded-full border-2 border-gray-200 bg-white pr-12 pl-4 text-gray-900 shadow-sm placeholder:text-gray-600 focus-visible:border-[#111111] focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <LanguageSwitcher />

              {/* Cart */}
              <button
                onClick={openCartPanel}
                className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#111111] hover:text-white"
                aria-label="Open cart"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-semibold tabular-nums leading-none text-white ring-2 ring-white">
                    {cartItemCount}
                  </div>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#111111] hover:text-white"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <UserIcon className="h-6 w-6" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/dashboard"
                        onClick={closeUserMenu}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("nav.dashboard")}
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeUserMenu}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t("nav.adminPanel")}
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("nav.signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="default"
                  className="hidden lg:flex rounded-full px-6 xl:px-8 py-5"
                  asChild
                >
                  <Link to="/login">{t("nav.signIn")}</Link>
                </Button>
              )}

              {/* Mobile/Tablet menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <HeaderProductSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmitSearch={handleSearchSubmit}
                onAfterNavigate={closeMobileMenu}
                formClassName="mb-4"
                inputClassName="w-full h-[44px] rounded-full border-2 border-gray-200 bg-white pr-12 pl-4 text-gray-900 shadow-sm placeholder:text-gray-600 focus-visible:border-[#111111] focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {/* Mobile Navigation */}
              {headerCategories.map((cat) =>
                cat.slug ? (
                  <Link
                    key={cat.id}
                    to={`${APP_PATHS.products}?category=${encodeURIComponent(cat.slug)}`}
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 text-base font-medium border rounded-none transition-colors ${
                      isCategoryNavActive(cat.slug)
                        ? "text-gray-900 border-[#111111]"
                        : "text-gray-700 border-transparent hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ) : null,
              )}

              {/* Mobile User Menu */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    >
                      {t("nav.adminPanel")}
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    {t("nav.signOut")}
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md text-center"
                  >
                    {t("nav.signUp")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <Outlet />

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white">
        <div className="container-custom">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 pt-[80px] pb-10">
            {/* Contact Information */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <Link to="/" className="inline-block mb-3">
                <AurevoWhite />
              </Link>
              <ul className="space-y-3 text-sm text-white">
                <li className="flex items-start gap-2">
                  <LocationIcon
                    width={16}
                    height={16}
                    className="mt-0.5 flex-shrink-0"
                    fill="#9CA3AF"
                  />
                  <span>{t("footer.address")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <EmailIcon
                    width={16}
                    height={16}
                    className="flex-shrink-0"
                    fill="#9CA3AF"
                  />
                  <a
                    href="mailto:aurevofashion88@gmail.com"
                    className="hover:text-gray-400 transition-colors"
                  >
                    aurevofashion88@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneIcon
                    width={16}
                    height={16}
                    className="flex-shrink-0"
                    fill="#9CA3AF"
                  />
                  <a
                    href="tel:+8801887375148"
                    className="hover:text-gray-400 transition-colors"
                  >
                    01887-375148
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneIcon
                    width={16}
                    height={16}
                    className="flex-shrink-0"
                    fill="#9CA3AF"
                  />
                  <a
                    href="tel:+8801752600246"
                    className="hover:text-gray-400 transition-colors"
                  >
                    01752-600246
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <WhatsAppIcon
                    width={16}
                    height={16}
                    className="flex-shrink-0"
                    fill="#9CA3AF"
                  />
                  <a
                    href="https://wa.me/+8801897919363"
                    className="hover:text-gray-400 transition-colors"
                  >
                    01897-919363
                  </a>
                </li>
              </ul>
            </div>

            {/* Category + About Shop: side-by-side on mobile only */}
            <div className="grid grid-cols-2 gap-8 sm:contents">
              {/* Category */}
              <div>
                <h3 className="text-base font-semibold mb-3 text-white min-h-[25px]">
                  {t("footer.category")}
                </h3>
                <ul className="space-y-3 text-sm">
                  {headerCategories
                    .filter((cat) => cat.slug)
                    .map((cat) => (
                      <li key={cat.id}>
                        <Link
                          to={`${APP_PATHS.products}?category=${encodeURIComponent(cat.slug!)}`}
                          className="text-white hover:text-gray-400 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

              {/* About Shop */}
              <div>
                <h3 className="text-base font-semibold mb-3 text-white min-h-[25px]">
                  {t("footer.aboutShop")}
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to={APP_PATHS.products}
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      {t("footer.category")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={APP_PATHS.support}
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      {t("footer.support")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={APP_PATHS.payment}
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      {t("footer.onlinePayment")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={APP_PATHS.tracking}
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      {t("footer.tracking")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={APP_PATHS.about}
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      {t("footer.aboutUs")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={APP_PATHS.terms}
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      {t("footer.terms")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Follow Us & Payment Method */}
            <div className="lg:col-span-2">
              {/* Follow Us */}
              <div className="mb-5">
                <h3 className="text-base font-semibold mb-3 text-white min-h-[25px]">
                  {t("footer.followUs")}
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href="https://web.facebook.com/aurevo.fashion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <FacebookSquareIcon width={22} height={22} />
                  </a>
                  {import.meta.env.VITE_FACEBOOK_PAGE_ID ? (
                    <a
                      href={`https://m.me/${import.meta.env.VITE_FACEBOOK_PAGE_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-90 transition-opacity"
                      title="Message us on Messenger"
                      aria-label="Message us on Messenger"
                    >
                      <MessengerIcon
                        className="h-[22px] w-[22px]"
                        gradientId="messenger-footer-gradient"
                      />
                    </a>
                  ) : null}
                  <a
                    href="https://instagram.com/aurevofashion88"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <InstagramIcon
                      width={22}
                      height={22}
                      fill="url(#instagram-gradient)"
                    />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient
                          id="instagram-gradient"
                          x1="0%"
                          y1="100%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#FFDC80" />
                          <stop offset="50%" stopColor="#F77737" />
                          <stop offset="100%" stopColor="#C13584" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <TikTokIcon width={22} height={22} fill="#FFFFFF" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <YoutubeIcon width={28} height={20} />
                  </a>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base font-semibold mb-3 text-white">
                  {t("footer.paymentMethod")}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <img
                    src={bkashImg}
                    alt="bKash"
                    className="h-7 w-auto object-contain bg-white rounded px-1.5 py-0.5 hover:cursor-pointer"
                  />
                  <img
                    src={nagadImg}
                    alt="Nagad"
                    className="h-7 w-auto object-contain bg-white rounded px-1.5 py-0.5 hover:cursor-pointer"
                  />
                  <img
                    src={visaImg}
                    alt="Visa"
                    className="h-7 w-auto object-contain bg-white rounded px-1.5 py-0.5 hover:cursor-pointer"
                  />
                  <img
                    src={masterCardImg}
                    alt="MasterCard"
                    className="h-7 w-auto object-contain bg-white rounded px-1.5 py-0.5 hover:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="py-6 border-t border-white">
            <p className="text-center text-gray-400 text-xs">
              © {new Date().getFullYear()} Aurevo Fashion. {t("footer.rights")}
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Side Panel */}
      <CartSidePanel />
    </div>
  );
};

export default Layout;
