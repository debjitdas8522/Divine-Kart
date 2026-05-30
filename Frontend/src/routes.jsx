import Spinner from '@/components/ui/Spinner';
import { ROUTES, VENDOR_ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Critical pages — eager loaded
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';

// Vendor auth & layout
import VendorProtectedRoute from '@/components/vendor/VendorProtectedRoute';
import VendorLayout from '@/components/vendor/VendorLayout';

// Lazy-loaded main pages
const ProductDetail  = lazy(() => import('@/pages/ProductDetail'));
const Category       = lazy(() => import('@/pages/Category'));
const Cart           = lazy(() => import('@/pages/Cart'));
const Checkout       = lazy(() => import('@/pages/Checkout'));
const Profile        = lazy(() => import('@/pages/Profile'));
const Orders         = lazy(() => import('@/pages/Orders'));
const OrderDetail    = lazy(() => import('@/pages/OrderDetail'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const VerifyOtp      = lazy(() => import('@/pages/VerifyOtp'));
const ResetPassword  = lazy(() => import('@/pages/ResetPassword'));

// Lazy-loaded vendor pages
const VendorLogin         = lazy(() => import('@/pages/vendor/VendorLogin'));
const VendorRegister      = lazy(() => import('@/pages/vendor/VendorRegister'));
const VendorDashboard     = lazy(() => import('@/pages/vendor/VendorDashboard'));
const VendorOrders        = lazy(() => import('@/pages/vendor/VendorOrders'));
const VendorProducts      = lazy(() => import('@/pages/vendor/VendorProducts'));
const VendorProfile       = lazy(() => import('@/pages/vendor/VendorProfile'));
const VendorNotifications = lazy(() => import('@/pages/vendor/VendorNotifications'));
const VendorOrderDetail  = lazy(() => import('@/pages/vendor/VendorOrderDetail'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public customer routes ──────────────────────────────── */}
        <Route path={ROUTES.LOGIN}          element={<Login />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.VERIFY_OTP}     element={<VerifyOtp />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        {/* ── Vendor public routes ────────────────────────────────── */}
        <Route path={VENDOR_ROUTES.LOGIN}    element={<VendorLogin />} />
        <Route path={VENDOR_ROUTES.REGISTER} element={<VendorRegister />} />

        {/* ── Vendor protected routes (sidebar layout) ────────────── */}
        <Route element={<VendorProtectedRoute />}>
          <Route element={<VendorLayout />}>
            <Route path={VENDOR_ROUTES.DASHBOARD}     element={<VendorDashboard />} />
            <Route path={VENDOR_ROUTES.ORDERS}        element={<VendorOrders />} />
            <Route path={VENDOR_ROUTES.ORDER_DETAIL}  element={<VendorOrderDetail />} />
            <Route path={VENDOR_ROUTES.PRODUCTS}      element={<VendorProducts />} />
            <Route path={VENDOR_ROUTES.PROFILE}       element={<VendorProfile />} />
            <Route path={VENDOR_ROUTES.NOTIFICATIONS} element={<VendorNotifications />} />
          </Route>
        </Route>

        {/* ── Customer routes with MainLayout ────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME}           element={<Home />} />
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route path={ROUTES.CATEGORY}       element={<Category />} />
          <Route path={ROUTES.CART}           element={<Cart />} />

          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.CHECKOUT}     element={<Checkout />} />
            <Route path={ROUTES.PROFILE}      element={<Profile />} />
            <Route path={ROUTES.ORDERS}       element={<Orders />} />
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
