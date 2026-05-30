import useVendorStore from '@/store/vendorStore';
import {
  getMyStore, getMyStoreOrders, getMyNotifications, getMyProducts,
} from '@/services/storeService';
import { VENDOR_ROUTES } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  AlertCircle, Bell, CheckCircle, Clock,
  DollarSign, Package, ShoppingBag, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// â”€â”€ Mini components (same pattern as AdminDashboard's StatsCard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BADGE = {
  pending:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border border-blue-200',
  processing: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  shipped:    'bg-purple-100 text-purple-700 border border-purple-200',
  delivered:  'bg-green-100 text-green-700 border border-green-200',
  cancelled:  'bg-red-100 text-red-700 border border-red-200',
};

const COLOR = {
  blue:   'bg-blue-100 text-blue-600',
  green:  'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-500',
};

const StatsCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${COLOR[color]}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-[900] text-gray-900 mt-1 tabular-nums tracking-tight">{value}</p>
    </div>
  </div>
);

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Dashboard = () => {
  const { setStore } = useVendorStore();

  const { data: storeRes, isLoading: storeLoading } = useQuery({
    queryKey: ['vendor-store'],
    queryFn: getMyStore,
    staleTime: 10_000,
  });
  const store = storeRes?.data ?? null;

  useEffect(() => { if (store) setStore(store); }, [store, setStore]);

  const { data: ordersRes } = useQuery({
    queryKey: ['vendor-orders-recent', store?._id],
    queryFn: () => getMyStoreOrders(store._id, { limit: 10 }),
    enabled: !!store?._id,
  });
  const recentOrders = ordersRes?.data ?? [];
  const totalOrders  = ordersRes?.pagination?.total ?? 0;

  const { data: productsRes } = useQuery({
    queryKey: ['vendor-products-count'],
    queryFn: () => getMyProducts({ limit: 1 }),
    enabled: !!store?._id,
  });
  const totalProducts = productsRes?.pagination?.total ?? (productsRes?.products?.length ?? 0);

  const { data: notifRes } = useQuery({
    queryKey: ['vendor-notif-count'],
    queryFn: () => getMyNotifications({ unreadOnly: 'true', limit: 1 }),
    refetchInterval: 30_000,
  });
  const unreadCount = notifRes?.unreadCount ?? 0;

  const totalRevenue = recentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const ordersByStatus = recentOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (storeLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-amber-500" />
    </div>
  );

  return (
    <div className="p-10 bg-gray-50/30 min-h-screen">

      {/* â”€â”€ Header (identical to AdminDashboard) â”€â”€ */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-gray-500">
              {store?.name ?? 'Your Store'} · {formatDateTime(new Date())}
            </p>
          </div>
        </div>
        {store && (
          store.isApproved
            ? <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" /> Live &amp; Accepting Orders
              </span>
            : <span className="inline-flex items-center gap-1.5 text-sm font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" /> Pending Admin Approval
              </span>
        )}
      </div>

      {/* Pending banner */}
      {store && !store.isApproved && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-700 text-sm">Approval Pending</p>
            <p className="text-amber-600 text-xs mt-0.5">
              Your store is under review. You will be notified once approved. You can set up your profile in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* â”€â”€ Stats Grid (identical to AdminDashboard) â”€â”€ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon={Package}     label="Total Products" value={totalProducts}              color="blue" />
        <StatsCard icon={ShoppingBag} label="Total Orders"   value={totalOrders}                color="green" />
        <StatsCard icon={DollarSign}  label="Total Revenue"  value={formatCurrency(totalRevenue)} color="purple" />
        <StatsCard icon={Bell}        label="Unread Alerts"  value={unreadCount || '-'}         color="orange" />
      </div>

      {/* â”€â”€ Two-column layout (identical to AdminDashboard) â”€â”€ */}
      <div className="grid lg:grid-cols-3 gap-10">

        {/* Recent Orders table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-[900] text-gray-900 tracking-tight uppercase italic flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" /> Recent Orders
              </h2>
              <Link
                to={VENDOR_ROUTES.ORDERS}
                className="text-xs font-black text-amber-500 hover:underline uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View full list
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No active orders</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4 px-2">Order Ref</th>
                      <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4">Timestamp</th>
                      <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4">Status</th>
                      <th className="text-right text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4 px-2">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-2">
                          <span className="text-sm font-black text-amber-500">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-5 text-xs font-bold text-gray-500">{formatDateTime(order.createdAt)}</td>
                        <td className="py-5">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize border ${BADGE[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-5 px-2 text-sm font-black text-gray-900 text-right">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-8 flex flex-col">

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-[900] text-gray-900 tracking-tight uppercase italic mb-8">Store Status</h2>
            <div className="space-y-6">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full group-hover:scale-y-125 transition-transform ${status === 'delivered' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{status}</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 tabular-nums">{count}</span>
                </div>
              ))}
              {Object.keys(ordersByStatus).length === 0 && (
                <p className="text-center text-xs font-bold text-gray-400 py-4 uppercase tracking-widest leading-loose">
                  Queue is currently empty
                </p>
              )}
            </div>
          </div>

          {/* Console Actions â€” dark panel, exactly like AdminDashboard */}
          <div className="bg-[#0B0F19] rounded-2xl p-8 shadow-xl shadow-gray-200/50 flex-1">
            <h2 className="text-lg font-[900] text-white tracking-tight uppercase italic mb-6">Console Actions</h2>
            <div className="space-y-4">
              <Link
                to={VENDOR_ROUTES.PRODUCTS}
                className="flex items-center justify-center w-full px-4 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-500/20"
              >
                Launch New Product
              </Link>
              <Link
                to={VENDOR_ROUTES.ORDERS}
                className="flex items-center justify-center w-full px-4 py-4 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all font-black uppercase text-xs tracking-widest"
              >
                Audit Orders
              </Link>
              <Link
                to={VENDOR_ROUTES.NOTIFICATIONS}
                className="relative flex items-center justify-center w-full px-4 py-4 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all font-black uppercase text-xs tracking-widest"
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
