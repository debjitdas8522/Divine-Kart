import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import Spinner from '@/components/ui/Spinner';
import Login from '@/pages/Login';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/AdminOrderDetail'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

// On admin.localhost:5173, routes are relative to root:
//   /          → Dashboard
//   /products  → Products
//   /orders    → Orders
//   /users     → Users
//   /login     → Admin login page

const AdminRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Admin login on subdomain */}
        <Route path="/login" element={<Login />} />

        {/* Protected admin pages */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/products/new" element={<AdminProductForm />} />
            <Route path="/products/edit/:id" element={<AdminProductForm />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* Fallback → dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
