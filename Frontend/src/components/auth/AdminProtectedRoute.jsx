import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
