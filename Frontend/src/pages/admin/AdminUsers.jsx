import {
  adminActivateUser,
  adminGetUsers,
  adminSuspendUser,
} from '@/services/adminUserService';
import { formatDateTime } from '@/utils/formatters';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  Crown,
  Loader2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Store,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

/* ─── Status badge ──────────────────────────────────── */
const statusBadge = (status) => {
  const map = {
    Active:
      'bg-green-100 text-green-700 border-green-200',
    Suspended:
      'bg-red-100 text-red-700 border-red-200',
    Inactive:
      'bg-gray-100 text-gray-500 border-gray-200',
  };
  const icons = { Active: '✅', Suspended: '🔴', Inactive: '⏸️' };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.Inactive}`}
    >
      {icons[status] || '⏸️'} {status}
    </span>
  );
};

/* ─── Role badge ────────────────────────────────────── */
const roleBadge = (role) => {
  const map = {
    admin: { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Crown className="w-3 h-3" />, label: 'Admin' },
    vendor: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Store className="w-3 h-3" />, label: 'Vendor' },
    user: { bg: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Users className="w-3 h-3" />, label: 'User' },
  };
  const r = map[role] || map.user;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${r.bg}`}>
      {r.icon} {r.label}
    </span>
  );
};

/* ─── Stats card ────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

/* ─── Confirm modal (same pattern as AdminStores) ──── */
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
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main page component ───────────────────────────── */
const AdminUsers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type: 'suspend' | 'activate', user }

  // Build query params
  const params = { page, limit: 20 };
  if (search.trim()) params.search = search.trim();
  if (roleFilter !== 'all') params.role = roleFilter;
  if (statusFilter !== 'all') params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, statusFilter, page],
    queryFn: () => adminGetUsers(params),
    placeholderData: keepPreviousData,
  });

  const users = data?.data ?? [];
  const stats = data?.stats ?? {};
  const pagination = data?.pagination;

  /* ── Mutations ── */
  const suspendMutation = useMutation({
    mutationFn: adminSuspendUser,
    onSuccess: (res) => {
      toast.success(res.message || 'User suspended.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to suspend user'),
  });

  const activateMutation = useMutation({
    mutationFn: adminActivateUser,
    onSuccess: (res) => {
      toast.success(res.message || 'User activated.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to activate user'),
  });

  const handleConfirm = () => {
    if (!modal) return;
    if (modal.type === 'suspend') suspendMutation.mutate(modal.user._id);
    if (modal.type === 'activate') activateMutation.mutate(modal.user._id);
  };

  const isMutating = suspendMutation.isPending || activateMutation.isPending;

  const roleTabs = ['all', 'user', 'vendor', 'admin'];
  const statusTabs = ['all', 'Active', 'Suspended'];

  /* ── Handle search with page reset ── */
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Users className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage platform users, vendors, and admins</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Customers" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Store} label="Vendors" value={stats.totalVendors} color="bg-indigo-100 text-indigo-600" />
        <StatCard icon={ShieldCheck} label="Admins" value={stats.totalAdmins} color="bg-purple-100 text-purple-600" />
        <StatCard icon={Ban} label="Suspended" value={stats.totalSuspended} color="bg-red-100 text-red-600" />
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
        />
      </div>

      {/* ── Filter rows ── */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Role filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</span>
          {roleTabs.map((t) => (
            <button
              key={t}
              onClick={() => { setRoleFilter(t); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition ${
                roleFilter === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
          {statusTabs.map((t) => (
            <button
              key={t}
              onClick={() => { setStatusFilter(t); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition ${
                statusFilter === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Users table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span className="col-span-3">User</span>
          <span className="col-span-3">Contact</span>
          <span className="col-span-2">Role</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2">Joined</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No users found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((user) => (
              <div key={user._id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center hover:bg-gray-50/50 transition gap-2 md:gap-0">
                {/* User info */}
                <div className="col-span-3 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate font-mono">{user._id}</p>
                </div>

                {/* Contact */}
                <div className="col-span-3 min-w-0 space-y-0.5">
                  {user.email && (
                    <p className="text-xs text-gray-600 truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      {user.email}
                    </p>
                  )}
                  {user.phone && (
                    <p className="text-xs text-gray-600 truncate flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      {user.phone}
                    </p>
                  )}
                  {!user.email && !user.phone && (
                    <p className="text-xs text-gray-300 italic">No contact info</p>
                  )}
                </div>

                {/* Role */}
                <div className="col-span-2">{roleBadge(user.role)}</div>

                {/* Status */}
                <div className="col-span-1">{statusBadge(user.status)}</div>

                {/* Joined */}
                <p className="col-span-2 text-xs text-gray-400">{user.createdAt ? formatDateTime(user.createdAt) : '—'}</p>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  {user.status === 'Active' && user.role !== 'admin' && (
                    <button
                      onClick={() => setModal({ type: 'suspend', user })}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                      title="Suspend user"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                  {user.status === 'Suspended' && (
                    <button
                      onClick={() => setModal({ type: 'activate', user })}
                      className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition"
                      title="Activate user"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <span className="text-[10px] text-gray-300 font-medium italic">Protected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm font-bold text-gray-500 hover:text-amber-500 disabled:opacity-30 transition"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {pagination.totalPages} · {pagination.total} total users
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="text-sm font-bold text-gray-500 hover:text-amber-500 disabled:opacity-30 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ConfirmModal
        isOpen={modal?.type === 'suspend'}
        title="Suspend User"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        loading={isMutating}
        confirmLabel="Suspend"
        variant="danger"
      >
        <p className="text-sm text-gray-600">
          Suspend <strong>{modal?.user?.name}</strong>?
        </p>
        <p className="text-xs text-gray-400 mt-1">
          They will not be able to log in or place orders while suspended.
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal?.type === 'activate'}
        title="Activate User"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        loading={isMutating}
        confirmLabel="Activate"
        variant="success"
      >
        <p className="text-sm text-gray-600">
          Reactivate <strong>{modal?.user?.name}</strong>?
        </p>
        <p className="text-xs text-gray-400 mt-1">
          They will be able to log in and use the platform again.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default AdminUsers;
