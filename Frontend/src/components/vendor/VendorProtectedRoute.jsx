import useVendorStore from '@/store/vendorStore';
import { VENDOR_ROUTES } from '@/utils/constants';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * VendorProtectedRoute — guards all vendor subdomain pages that require a logged-in vendor.
 * Checks for vendor and token in the Zustand store.
 */
const VendorProtectedRoute = () => {
  const { vendor, token } = useVendorStore();

  if (!vendor || !token) {
    return <Navigate to={VENDOR_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default VendorProtectedRoute;
