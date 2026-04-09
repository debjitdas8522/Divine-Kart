import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getOrders } from '@/services/orderService';
import { ORDER_STATUS, ROUTES } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, MapPin, Package, Settings, ShoppingBag, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { key: 'orders', label: 'My Orders', icon: ShoppingBag },
  { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { key: 'settings', label: 'Account Settings', icon: Settings },
];

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const orders = ordersData?.orders || [];

  const getStatusInfo = (status) => {
    const map = {
      [ORDER_STATUS.PENDING]:    { label: 'Pending',    color: 'text-yellow-600', bg: 'bg-yellow-50',  icon: '🕐' },
      [ORDER_STATUS.CONFIRMED]:  { label: 'Confirmed',  color: 'text-blue-600',   bg: 'bg-blue-50',    icon: '✅' },
      [ORDER_STATUS.PROCESSING]: { label: 'Processing', color: 'text-blue-600',   bg: 'bg-blue-50',    icon: '⚙️' },
      [ORDER_STATUS.SHIPPED]:    { label: 'In Transit', color: 'text-orange-600', bg: 'bg-orange-50',  icon: '🚚' },
      [ORDER_STATUS.DELIVERED]:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-50',   icon: '✅' },
      [ORDER_STATUS.CANCELLED]:  { label: 'Cancelled',  color: 'text-red-600',    bg: 'bg-red-50',     icon: '❌' },
    };
    return map[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: '📦' };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container-custom py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ── Sidebar ────────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Divine-Kart Account</p>
                {user?.name && (
                  <p className="text-sm font-bold text-gray-900 mt-1">{user.name}</p>
                )}
              </div>
              <nav className="py-2">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'addresses') navigate(ROUTES.PROFILE);
                      else if (key === 'settings') navigate(ROUTES.PROFILE);
                      else setActiveTab(key);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors text-left ${
                      activeTab === key
                        ? 'bg-primary-50 text-primary border-r-2 border-primary'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main: My Orders ─────────────────────────────────── */}
          <main className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-36 skeleton rounded-lg" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" strokeWidth={1} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6 text-sm">You haven't placed any orders yet.</p>
                  <Link
                    to={ROUTES.HOME}
                    className="bg-primary text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-primary-600 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const previewItems = order.items?.slice(0, 1) || [];
                    const extraCount = (order.items?.length || 0) - 1;
                    const isShipped = order.status === ORDER_STATUS.SHIPPED;
                    const isDelivered = order.status === ORDER_STATUS.DELIVERED;

                    return (
                      <div key={order._id} className="px-6 py-5">
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Placed on {formatDate(order.createdAt)} &nbsp;|&nbsp; Total: {formatCurrency(order.totalAmount)}
                            </p>
                          </div>

                          {/* Status + Track button */}
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                              {isDelivered && <span className="text-green-600">✔</span>}
                              {isShipped && <Truck className="w-3 h-3" />}
                              <span>
                                {isDelivered && order.deliveredAt
                                  ? `Delivered on ${formatDate(order.deliveredAt)}`
                                  : isShipped && order.estimatedDelivery
                                  ? `In Transit, Arriving by ${formatDate(order.estimatedDelivery)}`
                                  : statusInfo.label}
                              </span>
                            </div>
                            <Link
                              to={ROUTES.ORDER_DETAIL.replace(':id', order._id)}
                              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded hover:bg-primary-600 transition-colors whitespace-nowrap"
                            >
                              Track Order
                            </Link>
                          </div>
                        </div>

                        {/* Product preview */}
                        {previewItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 mb-2">
                            <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">{item.name}</span>
                              {extraCount > 0 && (
                                <span className="text-gray-400"> and {extraCount} more item{extraCount > 1 ? 's' : ''}</span>
                              )}
                            </p>
                          </div>
                        ))}

                        {/* View Details */}
                        <div className="flex justify-end">
                          <Link
                            to={ROUTES.ORDER_DETAIL.replace(':id', order._id)}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            View Details <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default Orders;
