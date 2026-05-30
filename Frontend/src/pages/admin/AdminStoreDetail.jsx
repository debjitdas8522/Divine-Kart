import {
  adminApproveStore,
  adminDeleteStore,
  adminGetStoreById,
  adminGetStoreOrders,
  adminSuspendStore,
} from '@/services/adminStoreService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, Phone, ShoppingBag, Store } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminStoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: storeRes, isLoading } = useQuery({
    queryKey: ['admin-store', id],
    queryFn: () => adminGetStoreById(id),
  });
  const store = storeRes?.data;

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-store-orders', id, ordersPage],
    queryFn: () => adminGetStoreOrders(id, { page: ordersPage, limit: 10 }),
    enabled: !!id,
  });
  const orders = ordersData?.orders ?? [];
  const pagination = ordersData?.pagination;

  const approveMutation = useMutation({
    mutationFn: (action) => adminApproveStore(id, action),
    onSuccess: (_, action) => {
      toast.success(action === 'approve' ? 'Store approved!' : 'Store rejected.');
      qc.invalidateQueries({ queryKey: ['admin-store', id] });
      qc.invalidateQueries({ queryKey: ['admin-stores'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: () => adminSuspendStore(id),
    onSuccess: () => {
      toast.success('Store set offline.');
      qc.invalidateQueries({ queryKey: ['admin-store', id] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteStore(id),
    onSuccess: () => {
      toast.success('Store deleted.');
      navigate('/stores');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );

  if (!store) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Store not found.</p>
      <button onClick={() => navigate('/stores')} className="mt-4 text-sm font-bold text-amber-500 hover:underline">
        Back to Stores
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/stores')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Stores
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-5">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-amber-100">
          {store.logo ? (
            <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Store className="w-8 h-8 text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-gray-900">{store.name}</h1>
            {store.isApproved && store.isActive
              ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">✅ Active</span>
              : store.isActive
              ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">⏳ Pending</span>
              : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">🔴 Offline</span>
            }
          </div>
          <p className="text-sm text-gray-500 mt-1">{store.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{store.address?.city}, {store.address?.state} — {store.address?.pincode}</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{store.phone}</span>
            {store.gstin && <span>GSTIN: {store.gstin}</span>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {!store.isApproved && store.isActive && (
            <>
              <button
                onClick={() => approveMutation.mutate('approve')}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => approveMutation.mutate('reject')}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                ❌ Reject
              </button>
            </>
          )}
          {store.isApproved && store.isActive && (
            <button
              onClick={() => suspendMutation.mutate()}
              disabled={suspendMutation.isPending}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-xl transition disabled:opacity-50"
            >
              🔴 Set Offline
            </button>
          )}
          <button
            onClick={() => { if (confirm('Delete this store permanently?')) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-xl transition disabled:opacity-50"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-sm uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Store Orders
          </h2>
          {pagination && <p className="text-xs text-gray-400">{pagination.total} total</p>}
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No orders for this store yet.</div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {orders.map((order) => (
                <div key={order._id} className="grid grid-cols-4 px-6 py-4 text-sm items-center hover:bg-gray-50/50">
                  <div>
                    <p className="font-bold text-gray-900 truncate">{order.orderId}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <p className="text-gray-600">{order.customer?.name}</p>
                  <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize w-fit ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <button onClick={() => setOrdersPage((p) => Math.max(1, p - 1))} disabled={ordersPage === 1}
                  className="text-sm font-bold text-gray-500 hover:text-amber-500 disabled:opacity-30 transition">← Prev</button>
                <span className="text-xs text-gray-400">Page {ordersPage} of {pagination.totalPages}</span>
                <button onClick={() => setOrdersPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={ordersPage === pagination.totalPages}
                  className="text-sm font-bold text-gray-500 hover:text-amber-500 disabled:opacity-30 transition">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminStoreDetail;
