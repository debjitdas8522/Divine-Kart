import StoreNotification from '../models/storeNotificationModel.js';
import Store from '../models/storeModel.js';

/**
 * GET /api/stores/me/notifications
 * Returns paginated notifications for the authenticated vendor's store.
 * Unread notifications come first.
 */
export async function getMyNotifications(req, res) {
    try {
        // Find the store owned by this vendor
        const store = await Store.findOne({ owner: req.userId });
        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this account.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = { store: store._id };
        if (req.query.unreadOnly === 'true') {
            query.isRead = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            StoreNotification.find(query)
                .populate('order', 'orderId totalAmount status createdAt')
                .sort({ isRead: 1, createdAt: -1 }) // unread first, then newest
                .skip(skip)
                .limit(limit)
                .lean(),
            StoreNotification.countDocuments(query),
            StoreNotification.countDocuments({ store: store._id, isRead: false })
        ]);

        return res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[getMyNotifications] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * PUT /api/stores/me/notifications/:id/read
 * Mark a single notification as read. Vendor can only mark their own.
 */
export async function markNotificationRead(req, res) {
    try {
        const store = await Store.findOne({ owner: req.userId });
        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this account.' });
        }

        const notification = await StoreNotification.findOneAndUpdate(
            { _id: req.params.id, store: store._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }

        return res.json({ success: true, data: notification });
    } catch (error) {
        console.error('[markNotificationRead] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * PUT /api/stores/me/notifications/read-all
 * Mark all notifications for the vendor's store as read.
 */
export async function markAllNotificationsRead(req, res) {
    try {
        const store = await Store.findOne({ owner: req.userId });
        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this account.' });
        }

        await StoreNotification.updateMany(
            { store: store._id, isRead: false },
            { isRead: true }
        );

        return res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        console.error('[markAllNotificationsRead] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
