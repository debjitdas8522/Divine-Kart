import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'Users', path: '/users' },
  ];

  return (
    <aside className="w-72 bg-[#0B0F19] text-white min-h-screen flex flex-col sticky top-0 h-screen shadow-xl border-r border-gray-800/50">
      {/* Logo Section */}
      <div className="p-8 pb-10">
        <button 
          onClick={() => {
            const hostname = window.location.hostname;
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : '';
            window.location.href = `${protocol}//${hostname.replace('admin.', '')}${port}`;
          }}
          className="flex items-center gap-3 group text-left"
        >
          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Divine-Kart</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Admin Console</p>
            </div>
          </div>
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</p>
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section: Logout */}
      <div className="p-6 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 w-full group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Secure Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
