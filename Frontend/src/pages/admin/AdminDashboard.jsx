import StatsCard from '@/components/admin/StatsCard';
import Badge from '@/components/ui/Badge';
import { getOrders } from '@/services/orderService';
import { getProducts } from '@/services/productService';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: getProducts,
  });

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
  });

  if (productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalUsers = 0; // Would need user count API

  // Recent orders (last 10)
  const recentOrders = orders.slice(0, 10);

  // Order status distribution
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusBadgeVariant = (status) => {
    const variants = {
      [ORDER_STATUS.PENDING]: 'warning',
      [ORDER_STATUS.PROCESSING]: 'info',
      [ORDER_STATUS.CONFIRMED]: 'info',
      [ORDER_STATUS.SHIPPED]: 'primary',
      [ORDER_STATUS.DELIVERED]: 'success',
      [ORDER_STATUS.CANCELLED]: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="p-10 bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-sm font-bold text-gray-500">Live system overview • {formatDateTime(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Package}
          label="Total Products"
          value={totalProducts}
          color="blue"
        />
        <StatsCard
          icon={ShoppingBag}
          label="Total Orders"
          value={totalOrders}
          color="green"
        />
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          color="purple"
        />
        <StatsCard
          icon={Users}
          label="Total Users"
          value={totalUsers || '-'}
          color="orange"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-[900] text-gray-900 tracking-tight uppercase italic flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-xs font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
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
                      <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4 px-2">
                        Order Ref
                      </th>
                      <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4">
                        Timestamp
                      </th>
                      <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4">
                        Status
                      </th>
                      <th className="text-right text-[11px] font-black text-gray-400 uppercase tracking-widest pb-4 px-2">
                        Net Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-2">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-sm font-black text-primary hover:underline decoration-2"
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-5 text-xs font-bold text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="py-5">
                          <Badge variant={getStatusBadgeVariant(order.status)} size="sm" className="font-black uppercase text-[10px]">
                            {order.status}
                          </Badge>
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

        {/* Status Distribution & Actions */}
        <div className="space-y-8 flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-[900] text-gray-900 tracking-tight uppercase italic mb-8">System Status</h2>
            
            <div className="space-y-6">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full group-hover:scale-y-125 transition-transform ${status === ORDER_STATUS.DELIVERED ? 'bg-green-500' : 'bg-primary'}`}></div>
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{status}</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 tabular-nums">{count}</span>
                </div>
              ))}
              {Object.keys(ordersByStatus).length === 0 && (
                <p className="text-center text-xs font-bold text-gray-400 py-4 uppercase tracking-widest leading-loose">Queue is currently empty</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0B0F19] rounded-2xl p-8 shadow-xl shadow-gray-200/50 flex-1">
            <h2 className="text-lg font-[900] text-white tracking-tight uppercase italic mb-6">Console Actions</h2>
            <div className="space-y-4">
              <Link
                to="/products/new"
                className="flex items-center justify-center w-full px-4 py-4 bg-primary text-white rounded-xl hover:bg-primary-600 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
              >
                Launch New Product
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center justify-center w-full px-4 py-4 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all font-black uppercase text-xs tracking-widest"
              >
                Audit Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
