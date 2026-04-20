import mongoose from 'mongoose';
import sendEmail from '../config/sendmail.js';
import Order from '../models/orderModel.js';
import { Product } from '../models/productModel.js';
import Store from '../models/storeModel.js';
import User from '../models/userModel.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';
import { storeApprovedTemplate, storeRejectedTemplate } from '../utils/storeEmailTemplates.js';
import generatedOtp from '../utils/generatedOtp.js';
import sendLoginOtpEmail from '../config/sendmail.js';
import loginOtpTemplate from '../utils/loginOtpTemplate.js';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Store Registration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/stores/register
 * Submit a new store registration application. Creates a vendor User if not exists.
 */
export async function registerStore(req, res) {
    const { name, ownerName, email, phone, street, city, state, pincode, lng, lat, description, gstin } = req.body;

    if (!name || !ownerName || !email || !phone) {
        return res.status(400).json({ success: false, message: 'name, ownerName, email, and phone are required.' });
    }

    try {
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user && user.role !== 'vendor') {
            return res.status(400).json({
                success: false,
                message: 'A non-vendor account already exists with this email. Please use a different email.'
            });
        }

        if (!user) {
            user = await User.create({
                name: ownerName,
                email: email.toLowerCase(),
                phone,
                password: 'STORE_PENDING_' + Date.now(),
                role: 'vendor'
            });
        }

        // Prevent duplicate store registration per owner
        const existingStore = await Store.findOne({ owner: user._id });
        if (existingStore) {
            return res.status(400).json({
                success: false,
                message: 'A store is already registered under this account.',
                storeStatus: existingStore.isApproved ? 'approved' : 'pending'
            });
        }

        const storeData = {
            owner: user._id,
            name,
            description: description || '',
            phone,
            email: email.toLowerCase(),
            gstin: gstin || '',
            isApproved: false
        };

        if (street || city || state || pincode) {
            storeData.address = { street, city, state, pincode };
        }

        if (lng && lat) {
            storeData.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        } else {
            // Default coordinates (required by schema) — admin must update
            storeData.location = { type: 'Point', coordinates: [0, 0] };
        }

        const store = await Store.create(storeData);

        return res.status(201).json({
            success: true,
            message: 'Store registration submitted successfully. Awaiting admin approval.',
            data: store
        });
    } catch (error) {
        console.error('[registerStore] Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A store with this email already exists.' });
        }
        return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR AUTH — OTP Login (delegates to existing user OTP system)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/stores/login/send-otp
 * Send OTP to the vendor's registered email.
 * Vendor must already be registered (store registration creates the User).
 */
export async function sendVendorLoginOtp(req, res) {
    const email = req.body?.email?.trim().toLowerCase();
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase(), role: 'vendor' });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No vendor account found with this email. Please register your store first.'
            });
        }

        const otp = String(generatedOtp());
        const ttl = 10 * 60 * 1000; // 10 minutes

        await User.findByIdAndUpdate(user._id, {
            loginOtp: otp,
            loginOtpExpiry: new Date(Date.now() + ttl)
        });

        await sendLoginOtpEmail({
            sendTo: user.email,
            subject: 'DivineKart Vendor Login OTP',
            html: loginOtpTemplate({ name: user.name || 'Vendor', otp })
        });

        console.log(`[VENDOR AUTH] OTP for ${email}: ${otp}`);

        return res.json({ success: true, message: 'OTP sent to your registered email.' });
    } catch (error) {
        console.error('[sendVendorLoginOtp] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * POST /api/stores/login/verify-otp
 * Verify OTP and issue JWT tokens for the vendor.
 */
export async function verifyVendorLoginOtp(req, res) {
    const email = req.body?.email?.trim().toLowerCase();
    const otp = req.body?.otp?.toString().trim();
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase(), role: 'vendor' });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Vendor account not found.' });
        }

        if (!user.loginOtp || !user.loginOtpExpiry || new Date() > new Date(user.loginOtpExpiry)) {
            return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please request a new one.' });
        }

        if (otp !== user.loginOtp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        // Clear OTP
        await User.findByIdAndUpdate(user._id, { loginOtp: null, loginOtpExpiry: null });

        // Generate tokens using the existing utils
        const { default: generatedAccessToken } = await import('../utils/generatedAccessToken.js');
        const { default: generatedRefreshToken } = await import('../utils/generatedRefreshToken.js');

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await generatedRefreshToken(user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        };

        res.cookie('token', accessToken, { ...cookieOptions, maxAge: 5 * 60 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        // Fetch store info
        const store = await Store.findOne({ owner: user._id }).lean();

        return res.json({
            success: true,
            token: accessToken,
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
            store: store || null
        });
    } catch (error) {
        console.error('[verifyVendorLoginOtp] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR PROFILE — My Store CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/stores/me
 * Returns the authenticated vendor's store profile.
 */
export async function getMyStore(req, res) {
    try {
        const store = await Store.findOne({ owner: req.userId })
            .populate('owner', 'name email phone')
            .lean();

        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this account.' });
        }

        return res.json({ success: true, data: store });
    } catch (error) {
        console.error('[getMyStore] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * PUT /api/stores/me
 * Update the authenticated vendor's store profile.
 * Allows updating: description, phone, address, location, serviceRadius, pincodes, openingHours
 */
export async function updateMyStore(req, res) {
    const ALLOWED_FIELDS = ['name', 'description', 'phone', 'gstin', 'address', 'serviceRadius', 'pincodes', 'openingHours'];

    try {
        const store = await Store.findOne({ owner: req.userId });
        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this account.' });
        }

        const updates = {};
        ALLOWED_FIELDS.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Handle location update
        if (req.body.lng !== undefined && req.body.lat !== undefined) {
            updates.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
            };
        }

        const updated = await Store.findByIdAndUpdate(
            store._id,
            updates,
            { new: true, runValidators: true }
        ).lean();

        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[updateMyStore] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * PUT /api/stores/me/logo
 * Upload store logo using ImageKit (reuses existing uploadImageClodinary utility).
 */
export async function updateStoreLogo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided.' });
        }

        const store = await Store.findOne({ owner: req.userId });
        if (!store) {
            return res.status(404).json({ success: false, message: 'No store found for this account.' });
        }

        const uploadResult = await uploadImageClodinary(req.file);
        const logoUrl = uploadResult?.url || uploadResult?.secure_url;

        if (!logoUrl) {
            return res.status(500).json({ success: false, message: 'Image upload failed.' });
        }

        const updated = await Store.findByIdAndUpdate(
            store._id,
            { logo: logoUrl },
            { new: true }
        ).lean();

        return res.json({ success: true, data: updated, logoUrl });
    } catch (error) {
        console.error('[updateStoreLogo] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Store Discovery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/stores/nearby?lat=&lng=&radius=&pincode=
 * Find approved + active stores near a customer's location.
 */
export async function getNearbyStores(req, res) {
    const { lng, lat, radius = 10, pincode } = req.query;

    try {
        let query = { isApproved: true, isActive: true };

        if (lng && lat) {
            query.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000
                }
            };
        } else if (pincode) {
            query.$or = [
                { pincodes: pincode },
                { 'address.pincode': pincode }
            ];
        } else {
            return res.status(400).json({ success: false, message: 'Provide lat/lng or pincode.' });
        }

        const stores = await Store.find(query)
            .select('name description logo address phone email openingHours serviceRadius pincodes location')
            .limit(20)
            .lean();

        return res.json({ success: true, count: stores.length, data: stores });
    } catch (error) {
        console.error('[getNearbyStores] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * GET /api/stores/:id
 * Get public store details by ID.
 */
export async function getStoreDetails(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid store ID.' });
        }

        const store = await Store.findById(req.params.id)
            .populate('owner', 'name email phone')
            .lean();

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        return res.json({ success: true, data: store });
    } catch (error) {
        console.error('[getStoreDetails] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * GET /api/stores/:id/products
 * Browse products available at a specific store (public).
 */
export async function getStoreProducts(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid store ID.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = { store: req.params.id };
        if (req.query.category) query.category = req.query.category;

        const [products, total] = await Promise.all([
            Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Product.countDocuments(query)
        ]);

        return res.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[getStoreProducts] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * GET /api/stores/:storeId/orders  (vendor access)
 * Orders routed to the authenticated vendor's store.
 */
export async function getStoreOrders(req, res) {
    const { storeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [orders, total] = await Promise.all([
            Order.find({ store: storeId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Order.countDocuments({ store: storeId })
        ]);

        return res.json({
            success: true,
            data: orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('[getStoreOrders] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Store Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stores
 * List all stores with optional filters: status, city, pincode
 */
export async function adminGetAllStores(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status === 'active') { query.isApproved = true; query.isActive = true; }
        if (req.query.status === 'pending') { query.isApproved = false; query.isActive = true; }
        if (req.query.status === 'suspended') { query.isActive = false; }
        if (req.query.city) query['address.city'] = { $regex: req.query.city, $options: 'i' };
        if (req.query.pincode) {
            query.$or = [{ pincodes: req.query.pincode }, { 'address.pincode': req.query.pincode }];
        }

        const [stores, total] = await Promise.all([
            Store.find(query)
                .populate('owner', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Store.countDocuments(query)
        ]);

        return res.json({
            success: true,
            data: stores,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('[adminGetAllStores] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * PUT /api/admin/stores/:id/approve
 * Approve or reject a pending store registration.
 */
export async function adminApproveStore(req, res) {
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'action must be "approve" or "reject".' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid store ID.' });
        }

        const store = await Store.findById(req.params.id).populate('owner', 'name email');
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        const ownerName = store.owner?.name || 'Vendor';
        const ownerEmail = store.owner?.email;

        if (action === 'approve') {
            store.isApproved = true;
            store.isActive = true;
            await store.save();

            // Send approval email
            if (ownerEmail) {
                await sendEmail({
                    sendTo: ownerEmail,
                    subject: `Your store "${store.name}" has been approved — DivineKart`,
                    html: storeApprovedTemplate({ storeName: store.name, ownerName })
                });
            }

            return res.json({ success: true, message: 'Store approved and vendor notified.', data: store });
        } else {
            store.isApproved = false;
            store.isActive = false;
            await store.save();

            // Send rejection email
            if (ownerEmail) {
                await sendEmail({
                    sendTo: ownerEmail,
                    subject: `Store application update — DivineKart`,
                    html: storeRejectedTemplate({ storeName: store.name, ownerName, reason: reason || '' })
                });
            }

            return res.json({ success: true, message: 'Store rejected and vendor notified.', data: store });
        }
    } catch (error) {
        console.error('[adminApproveStore] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * PUT /api/admin/stores/:id/suspend
 * Toggle store suspension — flips isActive between true/false.
 */
export async function adminSuspendStore(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid store ID.' });
        }

        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        store.isActive = !store.isActive;
        await store.save();

        const action = store.isActive ? 'reactivated' : 'suspended';
        return res.json({ success: true, message: `Store ${action} successfully.`, data: store });
    } catch (error) {
        console.error('[adminSuspendStore] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * DELETE /api/admin/stores/:id
 * Permanently remove a store from the platform.
 */
export async function adminDeleteStore(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid store ID.' });
        }

        const store = await Store.findByIdAndDelete(req.params.id);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        return res.json({ success: true, message: 'Store deleted successfully.' });
    } catch (error) {
        console.error('[adminDeleteStore] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * GET /api/admin/stores/:id/orders
 * Admin: all orders routed to a specific store, with pagination.
 */
export async function adminGetStoreOrders(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid store ID.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ store: req.params.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ store: req.params.id })
        ]);

        return res.json({
            success: true,
            data: orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('[adminGetStoreOrders] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
