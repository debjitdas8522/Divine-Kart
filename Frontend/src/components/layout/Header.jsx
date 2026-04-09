import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import useUIStore from '@/store/uiStore';
import { ROUTES } from '@/utils/constants';
import { MapPin, ShoppingCart, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const { toggleCartDrawer, selectedLocation } = useUIStore();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Section: Logo & Location */}
          <div className="flex items-center gap-6 min-w-fit">
            <Link to={ROUTES.HOME} className="flex items-center">
              <div className="text-xl md:text-2xl font-black text-primary tracking-tighter uppercase italic">
                DivineKart
              </div>
            </Link>

            {/* Location */}
            <button className="hidden lg:flex flex-col items-start -space-y-1">
              <span className="text-[10px] font-bold text-gray-900 uppercase">Delivery in 10 mins</span>
              <div className="flex items-center text-gray-600">
                <span className="text-sm font-semibold truncate max-w-[150px]">
                  {selectedLocation || 'Select Location'}
                </span>
                <MapPin className="w-3 h-3 ml-1 text-primary" />
              </div>
            </button>
          </div>

          {/* Center Section: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl px-4">
            <SearchBar />
          </div>

          {/* Right Section: Auth & Cart */}
          <div className="flex items-center gap-2 md:gap-4 min-w-fit">
            {/* Admin Dashboard Link */}
            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => {
                  const hostname = window.location.hostname;
                  const protocol = window.location.protocol;
                  const port = window.location.port ? `:${window.location.port}` : '';
                  if (!hostname.startsWith('admin.')) {
                    window.location.href = `${protocol}//admin.${hostname}${port}`;
                  }
                }}
                className="text-[10px] font-black py-1.5 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest hidden sm:block"
              >
                Admin Panel
              </button>
            )}

            {/* Profile / Login */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate(ROUTES.PROFILE)}
                className="p-2 text-gray-700 hover:text-primary transition-colors"
                title="Profile"
              >
                <User className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-sm font-bold text-gray-700 hover:text-primary px-2 transition-colors"
              >
                Login
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={toggleCartDrawer}
              className="flex items-center gap-2 bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primary-600 transition-all shadow-sm group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col items-start -space-y-1">
                <span className="text-[10px] font-bold uppercase opacity-80">My Cart</span>
                <span className="text-xs font-bold leading-none">{itemCount > 0 ? `${itemCount} Items` : '0 Items'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Header;
