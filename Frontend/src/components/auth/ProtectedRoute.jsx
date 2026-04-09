import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
