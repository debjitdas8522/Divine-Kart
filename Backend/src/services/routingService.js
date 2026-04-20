import Store from '../models/storeModel.js';

/**
 * Find the nearest approved + active store to a given coordinate.
 * Uses MongoDB 2dsphere $near index for sub-100ms performance.
 *
 * @param {number} lat - Customer latitude
 * @param {number} lng - Customer longitude
 * @returns {Promise<{store: object|null, routingMethod: string}>}
 */
export async function findNearestStoreByCoords(lat, lng) {
    // TODO: Phase 4 — cache result in Redis (TTL 5 min) keyed by `geo:${lat},${lng}`
    const store = await Store.findOne({
        isApproved: true,
        isActive: true,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                }
            }
        }
    }).lean();

    return { store: store || null, routingMethod: 'Proximity' };
}

/**
 * Find an approved + active store that serves a given pincode.
 *
 * @param {string} pincode
 * @returns {Promise<{store: object|null, routingMethod: string}>}
 */
export async function findStoreByPincode(pincode) {
    const store = await Store.findOne({
        isApproved: true,
        isActive: true,
        $or: [
            { pincodes: pincode },
            { 'address.pincode': pincode }
        ]
    }).lean();

    return { store: store || null, routingMethod: 'Pincode' };
}

/**
 * Master routing function — tries geo first, then pincode fallback.
 * Returns { store, routingMethod } where store may be null if no eligible store exists.
 * Order creation is NOT blocked when store is null — backwards compatible.
 *
 * @param {object} shippingAddress - { lat, lng, pincode, ... }
 * @returns {Promise<{store: object|null, routingMethod: string}>}
 */
export async function resolveStoreForOrder(shippingAddress) {
    try {
        const addr = typeof shippingAddress === 'string'
            ? JSON.parse(shippingAddress)
            : shippingAddress;

        if (addr?.lat && addr?.lng) {
            const result = await findNearestStoreByCoords(addr.lat, addr.lng);
            if (result.store) return result;
        }

        if (addr?.pincode) {
            const result = await findStoreByPincode(addr.pincode);
            if (result.store) return result;
        }
    } catch (err) {
        console.warn('[routingService] Failed to resolve store:', err.message);
    }

    return { store: null, routingMethod: 'Proximity' };
}
