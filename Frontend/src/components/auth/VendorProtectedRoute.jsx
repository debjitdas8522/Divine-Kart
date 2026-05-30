import useVendorStore from '@/store/vendorStore';
import { VENDOR_ROUTES } from '@/utils/constants';
import { Navigate, Outlet } from 'react-router-dom';

const VendorProtectedRoute = () => {
  const { isVendor, token } = useVendorStore();

  if (!isVendor || !token) {
    return <Navigate to={VENDOR_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default VendorProtectedRoute;
