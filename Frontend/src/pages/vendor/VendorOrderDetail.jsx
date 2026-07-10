import {
  getMyStore, getMyStoreOrderById, updateMyStoreOrderStatus,
} from '@/services/storeService';
import { VENDOR_ROUTES } from '@/utils/constants';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock,
  CreditCard, Mail, MapPin, Package, Phone, ShoppingBag,
  Truck, User, XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

// ── Constants ─────────────────────────────────────────────────────────────────

const PIPELINE = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_META = {
  pending:    { icon: Clock,         color: 'amber',   label: 'Order Received',     desc: 'Waiting for your confirmation' },
  confirmed:  { icon: CheckCircle2,  color: 'blue',    label: 'Confirmed',          desc: 'Preparing for fulfillment' },
  processing: { icon: Package,       color: 'indigo',  label: 'Processing',         desc: 'Order is being packed' },
  shipped:    { icon: Truck,         color: 'purple',  label: 'Shipped',            desc: 'Out for delivery' },
  delivered:  { icon: CheckCircle2,  color: 'emerald', label: 'Delivered',          desc: 'Successfully delivered' },
  cancelled:  { icon: XCircle,       color: 'red',     label: 'Cancelled',          desc: 'This order was cancelled' },
};

const COLOR_MAP = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-600',   dot: 'bg-amber-400',   ring: 'ring-amber-200',   fill: 'bg-amber-500' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-600',    dot: 'bg-blue-400',    ring: 'ring-blue-200',    fill: 'bg-blue-500' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-600',  dot: 'bg-indigo-400',  ring: 'ring-indigo-200',  fill: 'bg-indigo-500' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-600',  dot: 'bg-purple-400',  ring: 'ring-purple-200',  fill: 'bg-purple-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-400', ring: 'ring-emerald-200', fill: 'bg-emerald-500' },
  red:     { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600',     dot: 'bg-red-400',     ring: 'ring-red-200',     fill: 'bg-red-500' },
};

const getNextStatuses = (current) => {
  if (current === 'cancelled' || current === 'delivered') return [];
  const idx = PIPELINE.indexOf(current);
  return idx >= 0 ? PIPELINE.slice(idx + 1) : [];
};

// ── Status Timeline ───────────────────────────────────────────────────────────

const StatusTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'cancelled';
  const currentIdx  = PIPELINE.indexOf(currentStatus);

  const steps = isCancelled
    ? [...PIPELINE.slice(0, Math.max(currentIdx, 1)), 'cancelled']
    : PIPELINE;

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const meta  = STATUS_META[step];
        const colors = COLOR_MAP[meta.color];
        const Icon  = meta.icon;
        const isPast    = !isCancelled && PIPELINE.indexOf(step) < currentIdx;
        const isCurrent = step === currentStatus;
        const isFuture  = !isPast && !isCurrent;
        const isLast    = i === steps.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 min-w-0 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCurrent
                    ? `${colors.fill} text-white shadow-lg shadow-${meta.color}-500/25 ring-4 ${colors.ring}`
                    : isPast
                      ? `${colors.fill} text-white`
                      : 'bg-gray-100 text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                isCurrent ? colors.text : isPast ? 'text-gray-500' : 'text-gray-300'
              }`}>
                {meta.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-1">
                <div className={`h-0.5 rounded-full transition-all duration-500 ${
                  isPast ? colors.fill : 'bg-gray-100'
                }`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Order Detail Page ─────────────────────────────────────────────────────────

const VendorOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState('');

  // ── Fetch store ─────────────────────────────────────────────────────────────

  const { data: storeRes } = useQuery({
    queryKey: ['vendor-store'],
    queryFn: getMyStore,
    staleTime: 10_000,
  });
  const store = storeRes?.data ?? null;

  // ── Fetch order ─────────────────────────────────────────────────────────────

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['vendor-order', store?._id, id],
    queryFn: () => getMyStoreOrderById(store._id, id),
    enabled: !!store?._id && !!id,
  });
  const order = orderRes?.data ?? orderRes?.order ?? null;

  // ── Status mutation ─────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: ({ status }) => updateMyStoreOrderStatus(store._id, id, status, note),
    onSuccess: (_, { status }) => {
      toast.success(`Order marked as "${status}"`);
      qc.invalidateQueries({ queryKey: ['vendor-order'] });
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
      setNote('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Status update failed'),
  });

  const handleUpdate = (status) => {
    if (window.confirm(`Mark this order as "${status}"?`)) {
      mutation.mutate({ status });
    }
  };

  const nextStatuses = order ? getNextStatuses(order.status) : [];
  const canCancel = order && order.status !== 'delivered' && order.status !== 'cancelled';
  const currentMeta = order ? STATUS_META[order.status] : null;
  const currentColors = currentMeta ? COLOR_MAP[currentMeta.color] : null;

  // ── Loading / Error States ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-amber-500 mx-auto" />
          <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/40">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-[900] text-gray-900 mb-1">Order Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">This order may have been removed or doesn't belong to your store.</p>
          <button
            onClick={() => navigate(VENDOR_ROUTES.ORDERS)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const customerName  = order.customer?.name || order.user?.name || 'Guest Customer';
  const customerEmail = order.customer?.email || order.user?.email || null;
  const customerPhone = order.customer?.phone || order.user?.phone || null;

  const shippingAddr = order.shippingAddress
    ? [order.shippingAddress.addressLine, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(', ')
    : order.customer?.address || null;

  return (
    <div className="p-6 md:p-10 bg-gray-50/40 min-h-screen">

      {/* ── Back Button ────────────────────────────────────── */}
      <button
        onClick={() => navigate(VENDOR_ROUTES.ORDERS)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Back to Orders</span>
      </button>

      {/* ── Order Header ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-[900] text-gray-900 tracking-tight">
                #{order._id.slice(-8).toUpperCase()}
              </h1>
              {currentMeta && currentColors && (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full capitalize border ring-1 ${currentColors.bg} ${currentColors.text} ${currentColors.border} ${currentColors.ring}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentColors.dot}`} />
                  {order.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateTime(order.createdAt)}
              </span>
              <span>·</span>
              <span>{formatRelativeTime(order.createdAt)}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-[900] text-gray-900 tabular-nums">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</p>
              <p className="text-xl font-[900] text-gray-900 tabular-nums">{order.items?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <StatusTimeline currentStatus={order.status} />
      </div>

      {/* ── Main Content Grid ──────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Order Details (2 cols) ─────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Items Card ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-[900] text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                Order Items
              </h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {(order.items || []).map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-200 text-xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty <span className="font-bold text-gray-500">{item.quantity}</span> × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-[900] text-gray-900 tabular-nums shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-5 bg-gray-50/60 border-t border-gray-100 space-y-2">
              {order.subtotal > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tax</span>
                  <span className="font-bold">{formatCurrency(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span>Delivery</span>
                <span className="font-bold">{order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'FREE'}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Grand Total</span>
                <span className="text-xl font-[900] text-gray-900 tabular-nums">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* ── Customer Info Card ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-[900] text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Customer Information
            </h2>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-black text-lg shrink-0 border border-amber-200/50">
                {customerName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-base font-bold text-gray-900">{customerName}</p>
                {customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{customerPhone}</span>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{customerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Delivery Address Card ─────────────────────── */}
          {shippingAddr && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-[900] text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Delivery Address
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  {order.shippingAddress?.name && (
                    <p className="text-sm font-bold text-gray-900 mb-0.5">{order.shippingAddress.name}</p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">{shippingAddr}</p>
                  {order.shippingAddress?.phone && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Actions Panel (1 col) ─────────────────── */}
        <div className="space-y-6">

          {/* ── Payment Info ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-[900] text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Method</span>
                <span className="text-xs font-black text-gray-900 capitalize px-2.5 py-1 bg-gray-50 rounded-lg">
                  {order.paymentMethod || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize border ${
                  order.paymentStatus === 'Paid' || order.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">TXN ID</span>
                  <span className="text-[10px] font-bold text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded-lg">
                    {order.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Update Status ──────────────────────────────── */}
          {(nextStatuses.length > 0 || canCancel) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-[900] text-gray-900 uppercase tracking-widest mb-5">
                Update Status
              </h2>

              {/* Note field */}
              <div className="mb-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Status Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Out for delivery by 3pm"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Next status buttons */}
              {nextStatuses.length > 0 && (
                <div className="space-y-2 mb-3">
                  {nextStatuses.map((s, i) => {
                    const meta = STATUS_META[s];
                    const colors = COLOR_MAP[meta.color];
                    const Icon = meta.icon;
                    const isPrimary = i === 0;
                    return (
                      <button
                        key={s}
                        onClick={() => handleUpdate(s)}
                        disabled={mutation.isPending}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-40 ${
                          isPrimary
                            ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30'
                            : `${colors.bg} ${colors.text} ${colors.border} border hover:opacity-80`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="flex items-center gap-1">
                          Mark as {s} <ChevronRight className="w-3 h-3" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cancel button */}
              {canCancel && (
                <button
                  onClick={() => handleUpdate('cancelled')}
                  disabled={mutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-40"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Order
                </button>
              )}
            </div>
          )}

          {/* ── Completed / Cancelled State ─────────────────── */}
          {order.status === 'delivered' && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-[900] text-emerald-700 uppercase tracking-widest">Order Delivered</p>
              <p className="text-xs text-emerald-500 mt-1">
                This order has been successfully fulfilled.
              </p>
            </div>
          )}
          {order.status === 'cancelled' && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm font-[900] text-red-700 uppercase tracking-widest">Order Cancelled</p>
              <p className="text-xs text-red-400 mt-1">
                This order was cancelled and is no longer active.
              </p>
            </div>
          )}

          {/* ── Order Metadata ─────────────────────────────── */}
          <div className="bg-[#0B0F19] rounded-2xl p-6 shadow-xl shadow-gray-200/50">
            <h2 className="text-sm font-[900] text-white uppercase tracking-widest mb-5">
              Order Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order ID</span>
                <span className="text-xs font-bold text-amber-400 font-mono">{order._id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Placed At</span>
                <span className="text-xs font-bold text-gray-300">{formatDateTime(order.createdAt)}</span>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Updated</span>
                  <span className="text-xs font-bold text-gray-300">{formatRelativeTime(order.updatedAt)}</span>
                </div>
              )}
              {order.routingMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Routing</span>
                  <span className="text-xs font-bold text-gray-300 capitalize">{order.routingMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetail;
