import { useCart } from '@/hooks/useCart';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const { totalItems, toggleDrawer } = useCart();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home,        label: 'Home',    to: '/' },
    { icon: Search,      label: 'Search',  to: '/search' },
    { icon: User,        label: 'Account', to: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : ''}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Cart button */}
        <button
          onClick={toggleDrawer}
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce-once">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
