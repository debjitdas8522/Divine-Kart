import { Outlet } from 'react-router-dom';
import CartDrawer from '../cart/CartDrawer';
import BottomNav from './BottomNav';
import Header from './Header';
import AIChatWidget from '../ui/AIChatWidget';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-16 md:pb-0">
        <Outlet />
      </main>
      <CartDrawer />
      <BottomNav />
      <AIChatWidget />
    </div>
  );
};

export default MainLayout;
