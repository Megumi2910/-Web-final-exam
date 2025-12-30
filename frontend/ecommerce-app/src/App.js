import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CategoriesPage from './pages/CategoriesPage';
import FlashSalePage from './pages/FlashSalePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerStore from './pages/seller/SellerStore';
import SellerSettings from './pages/seller/SellerSettings';
import {
  CustomerLayout,
  CustomerDashboard,
  CustomerOrders,
  CustomerProfile,
  CustomerSettings,
  CustomerWishlist,
  ShoppingCart,
  CheckoutPage
} from './pages/customer';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Public routes with main layout */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/flash-sale" element={<Layout><FlashSalePage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/help" element={<Layout><HelpPage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
        <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Admin routes with admin layout - Protected for ADMIN role only */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Seller routes with seller layout - Protected for SELLER role only */}
        <Route path="/seller" element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <SellerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="store" element={<SellerStore />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>

        {/* Customer routes with customer layout - Protected for CUSTOMER role only */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="wishlist" element={<CustomerWishlist />} />
          <Route path="wallet" element={<CustomerDashboard />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>
        
        {/* Customer profile - accessible to CUSTOMER, ADMIN, and SELLER */}
        <Route path="/customer/profile" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SELLER']}>
            <Layout><CustomerProfile /></Layout>
          </ProtectedRoute>
        } />

        {/* Shopping cart and checkout - Protected for authenticated users */}
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
            <Layout><ShoppingCart /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
            <CheckoutPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
