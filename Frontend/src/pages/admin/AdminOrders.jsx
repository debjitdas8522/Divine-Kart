import Badge from '@/components/ui/Badge';
import { getOrders } from '@/services/orderService';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { Eye, Package, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
  });

  const orders = ordersData?.orders || [];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="mb-10">
        <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic">Order Manifest</h1>
        <div className="flex items-center gap-2 mt-1">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{filteredOrders.length} Active Shipments</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-10">
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by unique order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm font-medium text-sm placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm font-bold text-xs uppercase tracking-wider text-gray-700 cursor-pointer hover:border-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value={ORDER_STATUS.PENDING}>Pending</option>
            <option value={ORDER_STATUS.CONFIRMED}>Confirmed</option>
            <option value={ORDER_STATUS.PROCESSING}>Processing</option>
            <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
            <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
            <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F9FB] border-b border-gray-100">
                <tr>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Reference
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Customer Info
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Payload
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-right px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Net Amount
                  </th>
                  <th className="text-center px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Audit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-primary">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-gray-900 leading-tight">
                        {order.user?.name || order.shippingAddress?.name || 'N/A'}
                      </p>
                      <p className="text-xs font-bold text-gray-400 transition-colors group-hover:text-gray-600">
                        {order.user?.email || 'Guest User'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-300" />
                          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{order.items?.length || 0} SKU(s)</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={getStatusBadgeVariant(order.status)} size="sm" className="font-black uppercase text-[10px] tracking-widest">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-lg font-black text-gray-900 tabular-nums tracking-tight">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[3px]" />
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
