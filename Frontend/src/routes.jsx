import Spinner from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Eager load critical pages
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';

// Lazy load secondary pages
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Category = lazy(() => import('@/pages/Category'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Profile = lazy(() => import('@/pages/Profile'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const VerifyOtp = lazy(() => import('@/pages/VerifyOtp'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtp />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        {/* Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route path={ROUTES.CATEGORY} element={<Category />} />
          <Route path={ROUTES.CART} element={<Cart />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.ORDERS} element={<Orders />} />
            <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetail />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
