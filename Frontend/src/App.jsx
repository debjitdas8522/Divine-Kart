import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import AdminRoutes from './adminRoutes.jsx';
import VendorRoutes from './vendorRoutes.jsx';
import AppRoutes from './routes.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const hostname = window.location.hostname;
  const isAdminSubdomain = hostname.startsWith('admin.');
  const isVendorSubdomain = hostname.startsWith('vendor.');

  const getRoutes = () => {
    if (isAdminSubdomain) return <AdminRoutes />;
    if (isVendorSubdomain) return <VendorRoutes />;
    return <AppRoutes />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {getRoutes()}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontFamily: 'inherit',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
