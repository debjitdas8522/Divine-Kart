import User from '../models/userModel.js';

/**
 * GET /api/admin/users
 * List all users with search, role filter, status filter, and pagination.
 *
 * Query params:
 *   search  — partial match on name, email, or phone
 *   role    — 'user' | 'admin' | 'vendor'
 *   status  — 'Active' | 'Suspended' | 'Inactive'
 *   page    — page number (default 1)
 *   limit   — results per page (default 20)
 *   sort    — 'newest' | 'oldest' | 'name' (default 'newest')
 */
export async function adminGetAllUsers(req, res) {
    try {
        const {
            search = '',
            role = '',
            status = '',
            page = 1,
            limit = 20,
            sort = 'newest',
        } = req.query;

        const filter = {};

        // Search: match name, email, or phone (case-insensitive)
        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { name: regex },
                { email: regex },
                { phone: regex },
            ];
        }

        // Role filter
        if (role && ['user', 'admin', 'vendor'].includes(role)) {
            filter.role = role;
        }

        // Status filter
        if (status && ['Active', 'Suspended', 'Inactive'].includes(status)) {
            filter.status = status;
        }

        // Sort
        let sortOption = { createdAt: -1 }; // newest first (default)
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'name') sortOption = { name: 1 };

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -refreshToken -forgotPasswordOtp -forgotPasswordExpiry -loginOtp -loginOtpExpiry')
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            User.countDocuments(filter),
        ]);

        // Count by role for summary stats
        const [totalUsers, totalAdmins, totalVendors, totalSuspended] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'vendor' }),
            User.countDocuments({ status: 'Suspended' }),
        ]);

        return res.json({
            success: true,
            data: users,
            stats: {
                totalUsers,
                totalAdmins,
                totalVendors,
                totalSuspended,
            },
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('[adminGetAllUsers] Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch users',
        });
    }
}

/**
 * PUT /api/admin/users/:id/suspend
 * Suspend a user account. Admin cannot suspend themselves.
 */
export async function adminSuspendUser(req, res) {
    try {
        const { id } = req.params;

        // Prevent admin from suspending themselves
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot suspend your own account.',
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.status === 'Suspended') {
            return res.status(400).json({ success: false, message: 'User is already suspended.' });
        }

        user.status = 'Suspended';
        await user.save();

        return res.json({
            success: true,
            message: `User "${user.name}" has been suspended.`,
            data: { _id: user._id, name: user.name, status: user.status },
        });
    } catch (error) {
        console.error('[adminSuspendUser] Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to suspend user',
        });
    }
}

/**
 * PUT /api/admin/users/:id/activate
 * Reactivate a suspended user account.
 */
export async function adminActivateUser(req, res) {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.status === 'Active') {
            return res.status(400).json({ success: false, message: 'User is already active.' });
        }

        user.status = 'Active';
        await user.save();

        return res.json({
            success: true,
            message: `User "${user.name}" has been reactivated.`,
            data: { _id: user._id, name: user.name, status: user.status },
        });
    } catch (error) {
        console.error('[adminActivateUser] Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to activate user',
        });
    }
}
