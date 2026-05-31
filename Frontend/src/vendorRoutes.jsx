import Spinner from '@/components/ui/Spinner';
import { VENDOR_ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Vendor auth & layout
import VendorProtectedRoute from '@/components/vendor/VendorProtectedRoute';
import VendorLayout from '@/components/vendor/VendorLayout';

// Lazy-loaded vendor pages
const VendorLogin         = lazy(() => import('@/pages/vendor/VendorLogin'));
const VendorRegister      = lazy(() => import('@/pages/vendor/VendorRegister'));
const VendorDashboard     = lazy(() => import('@/pages/vendor/VendorDashboard'));
const VendorOrders        = lazy(() => import('@/pages/vendor/VendorOrders'));
const VendorProducts      = lazy(() => import('@/pages/vendor/VendorProducts'));
const VendorProfile       = lazy(() => import('@/pages/vendor/VendorProfile'));
const VendorNotifications = lazy(() => import('@/pages/vendor/VendorNotifications'));
const VendorOrderDetail   = lazy(() => import('@/pages/vendor/VendorOrderDetail'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

// On vendor.localhost:5173, routes are relative to root:
//   /login      → Vendor login page
//   /register   → Vendor registration page
//   /dashboard  → Dashboard
//   /orders     → Orders
//   /products   → Products
//   /profile    → Profile
//   /notifications → Notifications

const VendorRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Vendor public routes */}
        <Route path={VENDOR_ROUTES.LOGIN}    element={<VendorLogin />} />
        <Route path={VENDOR_ROUTES.REGISTER} element={<VendorRegister />} />

        {/* Protected vendor pages (sidebar layout) */}
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

        {/* Fallback → vendor login */}
        <Route path="*" element={<Navigate to={VENDOR_ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
};

export default VendorRoutes;
