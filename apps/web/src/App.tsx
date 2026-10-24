import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { VeeChatbot } from './components/chat/VeeChatbot';

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { RewardsWalletPage } from './pages/RewardsWalletPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import {
  ShippingPolicyPage,
  ReturnsPolicyPage,
  FAQPage,
  SupportPage,
} from './pages/PoliciesPages';

// Scroll to top helper on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DeliveryProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-brand-blush text-brand-text font-sans antialiased selection:bg-brand-palePink selection:text-brand-deepRose">
                {/* Global Announcement Header */}
                <AnnouncementBar />

                {/* Main Navigation Header */}
                <Header />

                {/* Main Application Routes */}
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductListingPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/rewards" element={<RewardsWalletPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="*" element={<HomePage />} />
                  </Routes>
                </main>

                {/* Floating AI Shopping Assistant */}
                <VeeChatbot />

                {/* Storefront Footer */}
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </DeliveryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
