import {
  adminApproveStore,
  adminDeleteStore,
  adminGetStores,
  adminSuspendStore,
} from '@/services/adminStoreService';
import { formatDateTime } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  Loader2,
  MoreVertical,
  Store,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const statusBadge = (store) => {
  if (!store.isApproved && store.isActive)
    return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">⏳ Pending</span>;
  if (store.isApproved && store.isActive)
    return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">✅ Active</span>;
  return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">🔴 Offline</span>;
};

const ConfirmModal = ({ isOpen, title, children, onConfirm, onCancel, loading, confirmLabel = 'Confirm', variant = 'primary' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-black text-gray-900 mb-3">{title}</h3>
        {children}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminStores = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type, store, reason? }
  const [reason, setReason] = useState('');
  const [page, setPage] = useState(1);

  const params = { page, limit: 20 };
  if (statusFilter !== 'all') params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stores', statusFilter, page],
    queryFn: () => adminGetStores(params),
  });
  const stores = data?.data ?? [];
  const pagination = data?.pagination;

  const approveMutation = useMutation({
    mutationFn: ({ id, action, reason }) => adminApproveStore(id, action, reason),
    onSuccess: (_, vars) => {
      toast.success(vars.action === 'approve' ? 'Store approved!' : 'Store rejected.');
      qc.invalidateQueries({ queryKey: ['admin-stores'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: adminSuspendStore,
    onSuccess: () => {
      toast.success('Store set offline.');
      qc.invalidateQueries({ queryKey: ['admin-stores'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to set offline'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteStore,
    onSuccess: () => {
      toast.success('Store deleted.');
      qc.invalidateQueries({ queryKey: ['admin-stores'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const handleConfirm = () => {
    if (!modal) return;
    if (modal.type === 'approve') approveMutation.mutate({ id: modal.store._id, action: 'approve' });
    if (modal.type === 'reject') approveMutation.mutate({ id: modal.store._id, action: 'reject', reason });
    if (modal.type === 'suspend') suspendMutation.mutate(modal.store._id);
    if (modal.type === 'delete') deleteMutation.mutate(modal.store._id);
  };

  const isMutating = approveMutation.isPending || suspendMutation.isPending || deleteMutation.isPending;

  const filterTabs = ['all', 'pending', 'active', 'offline'];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Store className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Stores</h1>
          <p className="text-sm text-gray-500">Manage vendor store applications and approvals</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((t) => (
          <button
            key={t}
            onClick={() => { setStatusFilter(t); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition ${
              statusFilter === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span className="col-span-2">Store / Owner</span>
          <span>City</span>
          <span>Status</span>
          <span>Registered</span>
          <span className="text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No stores found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stores.map((store) => (
              <div key={store._id} className="grid grid-cols-6 px-6 py-4 items-center hover:bg-gray-50/50 transition">
                <div className="col-span-2 min-w-0">
                  <button
                    onClick={() => navigate(`/stores/${store._id}`)}
                    className="text-sm font-bold text-gray-900 hover:text-amber-600 transition truncate block text-left"
                  >
                    {store.name}
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">{store.email}</p>
                </div>
                <p className="text-sm text-gray-600">{store.address?.city ?? '—'}</p>
                <div>{statusBadge(store)}</div>
                <p className="text-xs text-gray-400">{formatDateTime(store.createdAt)}</p>
                <div className="flex items-center justify-end gap-2">
                  {!store.isApproved && store.isActive && (
                    <>
                      <button
                        onClick={() => setModal({ type: 'approve', store })}
                        className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setModal({ type: 'reject', store }); setReason(''); }}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {store.isApproved && store.isActive && (
                    <button
                      onClick={() => setModal({ type: 'suspend', store })}
                      className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition"
                      title="Set Offline"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setModal({ type: 'delete', store })}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                    title="Delete"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="text-sm font-bold text-gray-500 hover:text-amber-500 disabled:opacity-30 transition">← Previous</button>
            <span className="text-xs text-gray-400">Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="text-sm font-bold text-gray-500 hover:text-amber-500 disabled:opacity-30 transition">Next →</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={modal?.type === 'approve'}
        title="Approve Store"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        loading={isMutating}
        confirmLabel="Approve"
      >
        <p className="text-sm text-gray-600">
          Approve <strong>{modal?.store?.name}</strong>? They will receive an email and can start receiving orders.
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal?.type === 'reject'}
        title="Reject Store"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        loading={isMutating}
        confirmLabel="Reject"
        variant="danger"
      >
        <p className="text-sm text-gray-600 mb-3">Reject <strong>{modal?.store?.name}</strong>? Please provide a reason:</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection (optional)…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-500"
        />
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal?.type === 'suspend'}
        title="Set Store Offline"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        loading={isMutating}
        confirmLabel="Set Offline"
        variant="danger"
      >
        <p className="text-sm text-gray-600">Set <strong>{modal?.store?.name}</strong> offline? They will no longer receive orders.</p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal?.type === 'delete'}
        title="Delete Store"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        loading={isMutating}
        confirmLabel="Delete Permanently"
        variant="danger"
      >
        <p className="text-sm text-red-600 font-semibold">⚠️ This action cannot be undone.</p>
        <p className="text-sm text-gray-600 mt-1">Delete <strong>{modal?.store?.name}</strong> permanently?</p>
      </ConfirmModal>
    </div>
  );
};

export default AdminStores;
