import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/hooks/use-cart";
import { useGuestCart } from "@/contexts/guest-cart-context";
import CartSidePanel from "@/components/cart-side-panel";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { openCartPanel } = useGuestCart();

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

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Category", href: "/products" },
    { name: "About us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
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
                <Link to="/">
                  <AurevoBlack />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm xl:text-base font-medium whitespace-nowrap`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right side: Search Bar + Icons + Sign In */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-y-0 right-5 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px] xl:w-[320px] h-[44px] rounded-full border-none bg-[#FAFAFA] placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none focus-visible:bg-[#F3F3F3] focus-visible:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)]"
                  />
                </div>
              </form>

              {/* Cart */}
              <button
                onClick={openCartPanel}
                className="relative p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
                aria-label="Open cart"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </div>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
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
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeUserMenu}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
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
                  <Link to="/login">Sign in</Link>
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
              {/* Mobile/Tablet Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 right-5 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[44px] rounded-full border-none bg-[#FAFAFA] placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none focus-visible:bg-[#F3F3F3] focus-visible:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)]"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Menu */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md text-center"
                  >
                    Sign Up
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
                  <span>Mirpur-11.5, Housing, Dhaka, Bangladesh</span>
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

            {/* Category */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-white min-h-[25px]">
                Category
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/products?category=men"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Man
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=women"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Women
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=kids"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Kids
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=boots"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Boots
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=slider"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    SLIDER
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Shop */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-white min-h-[25px]">
                About Shop
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Category
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    24/7 Support
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Fast Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/payment"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Online Payment
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tracking"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us & Payment Method */}
            <div className="lg:col-span-2">
              {/* Follow Us */}
              <div className="mb-5">
                <h3 className="text-base font-semibold mb-3 text-white min-h-[25px]">
                  Follow Us :
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
                  Payment Method:
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
              © {new Date().getFullYear()} Aurevo Fashion. All rights reserved.
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
