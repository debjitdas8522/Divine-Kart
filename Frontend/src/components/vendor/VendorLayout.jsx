import useVendorStore from '@/store/vendorStore';
import { VENDOR_ROUTES } from '@/utils/constants';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Tag,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getMyNotifications, toggleMyStoreStatus } from '@/services/storeService';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: VENDOR_ROUTES.DASHBOARD },
  { icon: ShoppingBag, label: 'Orders', path: VENDOR_ROUTES.ORDERS },
  { icon: Tag, label: 'My Products', path: VENDOR_ROUTES.PRODUCTS },
  { icon: Bell, label: 'Notifications', path: VENDOR_ROUTES.NOTIFICATIONS },
  { icon: User, label: 'Profile', path: VENDOR_ROUTES.PROFILE },
];

const VendorLayout = () => {
  const { vendor, store, setStore, logout } = useVendorStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toggling, setToggling] = useState(false);

  const isOnline = store?.isActive !== false;

  // Poll unread notifications every 30 s
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getMyNotifications({ unreadOnly: 'true', limit: 1 });
        setUnreadCount(data?.unreadCount ?? 0);
      } catch {
        /* silent */
      }
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(VENDOR_ROUTES.LOGIN);
  };

  const handleToggleStatus = async () => {
    if (!store?._id) return;
    setToggling(true);
    try {
      const res = await toggleMyStoreStatus();
      if (setStore && res.data) setStore(res.data);
      qc.invalidateQueries({ queryKey: ['vendor-store'] });
      toast.success(res.message ?? (res.isActive ? 'Store is now ONLINE 🟢' : 'Store is now OFFLINE 🔴'));
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Could not update store status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-64 bg-[#0E1117] text-white min-h-screen flex flex-col sticky top-0 h-screen shadow-xl border-r border-gray-800/50 shrink-0">
        {/* Brand */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Store className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase italic">
                Divine-Kart
              </h1>
              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest leading-none">
                Vendor Portal
              </p>
            </div>
          </div>

          {/* Store info pill */}
          {store && (
            <div className="mt-5 bg-gray-800/60 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <Store className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{store.name}</p>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    store.isApproved
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {store.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>
            </div>
          )}

          {/* ── Online / Offline Toggle ── */}
          {store?.isApproved && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`mt-3 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300 ${
                isOnline
                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                  : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {isOnline && !toggling && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    toggling ? 'bg-yellow-400' : isOnline ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                </span>
                <span className={`text-xs font-black uppercase tracking-widest ${
                  toggling ? 'text-yellow-300' : isOnline ? 'text-green-300' : 'text-red-300'
                }`}>
                  {toggling ? 'Updating…' : isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                isOnline ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  isOnline ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isNotif = item.path === VENDOR_ROUTES.NOTIFICATIONS;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="font-semibold text-sm">{item.label}</span>
                {isNotif && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Vendor identity + logout */}
        <div className="p-4 mt-auto border-t border-gray-800/50">
          {vendor && (
            <div className="flex items-center gap-2 px-2 mb-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{vendor.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{vendor.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
