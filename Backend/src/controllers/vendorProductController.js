import { Product } from '../models/productModel.js';
import Store from '../models/storeModel.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve the vendor's store from the authenticated user
// ─────────────────────────────────────────────────────────────────────────────
const getVendorStore = async (userId) => {
    const store = await Store.findOne({ owner: userId });
    if (!store) {
        throw Object.assign(new Error('No store found for this vendor.'), { status: 404 });
    }
    if (!store.isApproved) {
        throw Object.assign(
            new Error('Your store is not approved yet. You cannot manage products until approved.'),
            { status: 403 }
        );
    }
    return store;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stores/me/products
// List all products belonging to the vendor's store
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProducts = async (req, res, next) => {
    try {
        const store = await getVendorStore(req.userId);

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit) || 20));
        const skip  = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find({ store: store._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments({ store: store._id }),
        ]);

        res.json({
            success: true,
            data: products,
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext:  page * limit < total,
                hasPrev:  page > 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stores/me/products/:productId
// Single product detail (vendor must own the store the product belongs to)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProductById = async (req, res, next) => {
    try {
        const store   = await getVendorStore(req.userId);
        const product = await Product.findOne({ _id: req.params.productId, store: store._id }).lean();
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found in your store.' });
        }
        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/stores/me/products
// Vendor creates a new product linked to their store
// ─────────────────────────────────────────────────────────────────────────────
export const createMyProduct = async (req, res, next) => {
    try {
        const store = await getVendorStore(req.userId);

        const { name, description, category, price, OldPrice } = req.body;
        const stock = req.body.stock !== undefined ? Number(req.body.stock) : 0;

        // Validate required fields BEFORE image upload to prevent orphaned uploads
        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                details: {
                    name:     !name     ? 'name is required'     : undefined,
                    category: !category ? 'category is required' : undefined,
                },
            });
        }

        const parsedPrice    = Number(price);
        const parsedOldPrice = OldPrice !== undefined ? Number(OldPrice) : parsedPrice;

        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ success: false, message: 'price must be a non-negative number' });
        }

        // Upload image to vendor's store folder in ImageKit
        let imageUrl = req.body.imageUrl ?? null;
        if (req.file) {
            try {
                const folder = `/divinekart/stores/${store._id}/products`;
                const result = await uploadImageClodinary(req.file, folder);
                imageUrl = result?.url || result?.secure_url || imageUrl;

                // Persist root folder path to store doc on first upload
                if (!store.imagekitFolder) {
                    await Store.findByIdAndUpdate(store._id, {
                        imagekitFolder: `/divinekart/stores/${store._id}`
                    });
                }
            } catch (uploadErr) {
                console.error('[createMyProduct] Image upload error:', uploadErr);
                return res.status(500).json({ success: false, message: 'Failed to upload product image' });
            }
        }

        const product = await Product.create({
            name:        name.trim(),
            description: typeof description === 'string' ? description.trim() : '',
            category,
            price:       parsedPrice,
            OldPrice:    parsedOldPrice,
            imageUrl,
            stock:       isNaN(stock) ? 0 : stock,
            store:       store._id,
            storePrice:  parsedPrice,
            storeStock:  isNaN(stock) ? 0 : stock,
        });

        res.status(201).json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/stores/me/products/:productId
// Vendor updates one of their own products
// ─────────────────────────────────────────────────────────────────────────────
export const updateMyProduct = async (req, res, next) => {
    try {
        const store = await getVendorStore(req.userId);

        const product = await Product.findOne({ _id: req.params.productId, store: store._id });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or does not belong to your store.',
            });
        }

        const { name, description, category, price, OldPrice } = req.body;
        const stock = req.body.stock !== undefined ? Number(req.body.stock) : undefined;

        // Optional new image — store in vendor's products folder
        let imageUrl = req.body.imageUrl ?? product.imageUrl;
        if (req.file) {
            try {
                const folder = `/divinekart/stores/${store._id}/products`;
                const result = await uploadImageClodinary(req.file, folder);
                imageUrl = result?.url || result?.secure_url || imageUrl;
            } catch {
                return res.status(500).json({ success: false, message: 'Failed to upload image' });
            }
        }

        const parsedPrice    = price    !== undefined ? Number(price)    : undefined;
        const parsedOldPrice = OldPrice !== undefined ? Number(OldPrice) : undefined;

        const updated = await Product.findByIdAndUpdate(
            product._id,
            {
                ...(name                                                    && { name: name.trim() }),
                ...(typeof description === 'string'                             && { description: description.trim() }),
                ...(category                                                && { category }),
                ...(parsedPrice    !== undefined && !isNaN(parsedPrice)    && { price: parsedPrice,    storePrice: parsedPrice }),
                ...(parsedOldPrice !== undefined && !isNaN(parsedOldPrice) && { OldPrice: parsedOldPrice }),
                ...(imageUrl                                                && { imageUrl }),
                ...(stock !== undefined && !isNaN(stock)                   && { stock, storeStock: stock }),
            },
            { new: true, runValidators: true }
        );

        res.json({ success: true, product: updated });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/stores/me/products/:productId
// Vendor deletes one of their own products
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMyProduct = async (req, res, next) => {
    try {
        const store = await getVendorStore(req.userId);

        const deleted = await Product.findOneAndDelete({ _id: req.params.productId, store: store._id });
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or does not belong to your store.',
            });
        }

        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
        next(err);
    }
};
