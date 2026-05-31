import useVendorStore from '@/store/vendorStore';
import { VENDOR_ROUTES } from '@/utils/constants';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * VendorProtectedRoute — guards all vendor subdomain pages that require a logged-in vendor.
 * Checks Zustand isVendor flag AND the presence of vendor-token in localStorage.
 */
const VendorProtectedRoute = () => {
  const { isVendor } = useVendorStore();
  const token = localStorage.getItem('vendor-token');

  if (!isVendor || !token) {
    return <Navigate to={VENDOR_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default VendorProtectedRoute;
