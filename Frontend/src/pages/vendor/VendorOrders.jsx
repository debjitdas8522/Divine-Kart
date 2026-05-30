import {
  getMyStore, getMyStoreOrders,
} from '@/services/storeService';
import { VENDOR_ROUTES } from '@/utils/constants';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownUp, ArrowUpRight, CalendarDays, ChevronRight,
  Clock, DollarSign, Eye, Filter, Package, Search,
  ShoppingBag, TrendingUp, Truck, XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',        label: 'All Orders',  icon: ShoppingBag },
  { key: 'pending',    label: 'Pending',     icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',   icon: Package },
  { key: 'processing', label: 'Processing',  icon: Filter },
  { key: 'shipped',    label: 'Shipped',     icon: Truck },
  { key: 'delivered',  label: 'Delivered',   icon: TrendingUp },
  { key: 'cancelled',  label: 'Cancelled',   icon: XCircle },
];

const BADGE = {
  pending:    'bg-amber-50 text-amber-600 border-amber-200 ring-amber-100',
  confirmed:  'bg-blue-50 text-blue-600 border-blue-200 ring-blue-100',
  processing: 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-indigo-100',
  shipped:    'bg-purple-50 text-purple-600 border-purple-200 ring-purple-100',
  delivered:  'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100',
  cancelled:  'bg-red-50 text-red-600 border-red-200 ring-red-100',
};

const BADGE_DOT = {
  pending:    'bg-amber-400',
  confirmed:  'bg-blue-400',
  processing: 'bg-indigo-400',
  shipped:    'bg-purple-400',
  delivered:  'bg-emerald-400',
  cancelled:  'bg-red-400',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sublabel, color, accent }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:shadow-md transition-all duration-300`}>
    {/* Accent gradient bg */}
    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500 ${accent}`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">{label}</p>
        <p className="text-2xl font-[900] text-gray-900 tracking-tight tabular-nums">{value}</p>
        {sublabel && (
          <p className="text-[11px] font-bold text-gray-400 mt-1">{sublabel}</p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

// ── Status Pill ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full capitalize border ring-1 ${BADGE[status] ?? 'bg-gray-50 text-gray-600 border-gray-200 ring-gray-100'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${BADGE_DOT[status] ?? 'bg-gray-400'}`} />
    {status}
  </span>
);

// ── Main Component ────────────────────────────────────────────────────────────

const VendorOrders = () => {
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeTab, setActiveTab]       = useState('all');
  const [sortBy, setSortBy]             = useState('newest');

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data: storeRes } = useQuery({
    queryKey: ['vendor-store'],
    queryFn: getMyStore,
    staleTime: 10_000,
  });
  const store = storeRes?.data ?? null;

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['vendor-orders', store?._id],
    queryFn: () => getMyStoreOrders(store._id, { limit: 200 }),
    enabled: !!store?._id,
  });
  const allOrders = ordersRes?.data ?? [];

  // ── Computed ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total     = allOrders.length;
    const pending   = allOrders.filter(o => o.status === 'pending').length;
    const revenue   = allOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgOrder  = total > 0 ? revenue / Math.max(allOrders.filter(o => o.status !== 'cancelled').length, 1) : 0;
    return { total, pending, revenue, avgOrder };
  }, [allOrders]);

  const statusCounts = useMemo(() => {
    const counts = { all: allOrders.length };
    allOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    let list = [...allOrders];

    // Status filter
    if (activeTab !== 'all') {
      list = list.filter(o => o.status === activeTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o =>
        o._id.toLowerCase().includes(q) ||
        (o.customer?.name || o.user?.name || '').toLowerCase().includes(q) ||
        (o.customer?.email || o.user?.email || '').toLowerCase().includes(q) ||
        (o.customer?.phone || o.user?.phone || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest')     return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')     return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'amount-hi')  return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === 'amount-lo')  return (a.totalAmount || 0) - (b.totalAmount || 0);
      return 0;
    });

    return list;
  }, [allOrders, activeTab, searchQuery, sortBy]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-10 bg-gray-50/40 min-h-screen">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic">
            Order Management
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              {store?.name ?? 'Your Store'} · {filteredOrders.length} orders
            </p>
          </div>
        </div>

        {stats.pending > 0 && (
          <button
            onClick={() => setActiveTab('pending')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-bold text-xs uppercase tracking-widest hover:bg-amber-100 transition-all group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {stats.pending} orders need action
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* ── Stats Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={ShoppingBag} label="Total Orders"  value={stats.total}
          color="bg-blue-100 text-blue-600"   accent="bg-blue-500"
        />
        <StatCard
          icon={Clock}       label="Pending"       value={stats.pending}
          sublabel="Require attention"
          color="bg-amber-100 text-amber-600" accent="bg-amber-500"
        />
        <StatCard
          icon={DollarSign}  label="Total Revenue" value={formatCurrency(stats.revenue)}
          color="bg-emerald-100 text-emerald-600" accent="bg-emerald-500"
        />
        <StatCard
          icon={TrendingUp}  label="Avg. Order"    value={formatCurrency(stats.avgOrder)}
          sublabel="Per transaction"
          color="bg-purple-100 text-purple-600" accent="bg-purple-500"
        />
      </div>

      {/* ── Status Tabs ────────────────────────────────────── */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {STATUS_TABS.map(({ key, label, icon: Icon }) => {
            const count = statusCounts[key] || 0;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 border whitespace-nowrap ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/15'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search & Sort ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 shadow-sm font-medium text-sm placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <ArrowDownUp className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm font-bold text-xs uppercase tracking-wider text-gray-600 cursor-pointer hover:border-gray-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-hi">Highest Amount</option>
            <option value="amount-lo">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* ── Orders Table ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-amber-500" />
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading orders…</p>
          </div>
        ) : !store ? (
          <div className="p-20 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Store not found</p>
            <p className="text-gray-300 text-xs mt-1">Your store profile could not be loaded.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-500 font-bold text-sm mb-1">No orders found</p>
            <p className="text-gray-400 text-xs">
              {searchQuery ? 'Try adjusting your search term.' : activeTab !== 'all' ? 'No orders with this status yet.' : 'Orders will appear here once customers start ordering.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Items</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Payment</th>
                  <th className="text-right px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="text-center px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const customerName = order.customer?.name || order.user?.name || 'Guest';
                  const customerInitial = customerName[0]?.toUpperCase() || '?';
                  return (
                    <tr key={order._id} className="group hover:bg-amber-50/30 transition-colors duration-200">
                      {/* Order ID + Date */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-sm text-amber-600 tracking-tight">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <CalendarDays className="w-3 h-3" />
                            {formatRelativeTime(order.createdAt)}
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-black text-xs shrink-0 border border-amber-200/50">
                            {customerInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{customerName}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                              {order.customer?.phone || order.user?.phone || order.customer?.email || order.user?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-300" />
                          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">
                            {order.items?.length || 0} SKU{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest capitalize">
                            {order.paymentMethod || '—'}
                          </span>
                          <span className={`text-[10px] font-bold capitalize ${
                            order.paymentStatus === 'Paid' || order.paymentStatus === 'paid'
                              ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-[900] text-gray-900 tabular-nums tracking-tight">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`${VENDOR_ROUTES.ORDERS}/${order._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-amber-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 group/btn"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.5px]" />
                          <span className="hidden sm:inline">Inspect</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 -ml-1 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-200" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Footer Info ────────────────────────────────────── */}
      {filteredOrders.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-bold px-2">
          <p>
            Showing {filteredOrders.length} of {allOrders.length} order{allOrders.length !== 1 ? 's' : ''}
          </p>
          <p className="uppercase tracking-widest text-[10px]">
            Last refreshed · {formatDateTime(new Date())}
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
