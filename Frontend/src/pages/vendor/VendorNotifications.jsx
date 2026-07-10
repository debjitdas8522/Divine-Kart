import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/storeService';
import { formatDateTime } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck, Loader2, Package } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const VendorNotifications = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['vendor-notifications', page, unreadOnly],
    queryFn: () => getMyNotifications({ page, limit: 20, unreadOnly: unreadOnly ? 'true' : 'false' }),
    refetchInterval: 30_000,
  });

  const notifications = data?.data ?? [];
  const unreadCount   = data?.unreadCount ?? 0;
  const pagination    = data?.pagination;

  const markOneMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => { toast.success('All marked as read'); qc.invalidateQueries({ queryKey: ['vendor-notifications'] }); },
    onError: () => toast.error('Failed to mark all as read'),
  });

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{unreadCount} unread</span>}
          {isFetching && !isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unread only</span>
            <button onClick={() => { setUnreadOnly((v) => !v); setPage(1); }}
              className={`w-10 h-5 rounded-full transition-colors relative ${unreadOnly ? 'bg-amber-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${unreadOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          {unreadCount > 0 && (
            <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-amber-500 transition disabled:opacity-40">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{unreadOnly ? 'No unread notifications' : 'No notifications yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n._id} className={`px-6 py-4 flex items-start gap-4 transition ${!n.isRead ? 'bg-amber-50/50' : 'hover:bg-gray-50/50'}`}>
                <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${!n.isRead ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <Package className={`w-4 h-4 ${!n.isRead ? 'text-amber-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markOneMutation.mutate(n._id)} disabled={markOneMutation.isPending}
                    className="flex-shrink-0 text-[10px] font-bold text-amber-500 hover:text-amber-600 border border-amber-200 px-2 py-1 rounded-lg transition hover:bg-amber-50 disabled:opacity-40">
                    Mark read
                  </button>
                )}
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
    </div>
  );
};

export default VendorNotifications;
