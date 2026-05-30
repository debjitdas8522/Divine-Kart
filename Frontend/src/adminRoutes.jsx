import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import Spinner from '@/components/ui/Spinner';
import Login from '@/pages/Login';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminStores = lazy(() => import('@/pages/admin/AdminStores'));
const AdminStoreDetail = lazy(() => import('@/pages/admin/AdminStoreDetail'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

// On admin.localhost:5173, routes are relative to root:
//   /          → Dashboard
//   /users     → Users
//   /stores    → Stores
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
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/stores" element={<AdminStores />} />
            <Route path="/stores/:id" element={<AdminStoreDetail />} />
          </Route>
        </Route>

        {/* Fallback → dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
