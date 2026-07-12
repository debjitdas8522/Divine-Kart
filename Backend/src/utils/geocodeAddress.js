const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

/**
 * Build a single-line address query from individual fields.
 * @param {{ street?: string, city?: string, state?: string, pincode?: string }} parts
 * @returns {string}
 */
function buildAddressQuery({ street, city, state, pincode } = {}) {
    return [street, city, state, pincode].filter(Boolean).join(', ');
}

/**
 * Forward-geocode an address to { lat, lng }.
 * @param {{ street?: string, city?: string, state?: string, pincode?: string }} addressParts
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export default async function geocodeAddress(addressParts) {
    if (!OPENCAGE_API_KEY) {
        console.warn('[geocodeAddress] OPENCAGE_API_KEY is not set — skipping geocoding.');
        return null;
    }

    const query = buildAddressQuery(addressParts);
    if (!query || query.trim().length < 3) {
        return null;
    }

    try {
        const url =
            `https://api.opencagedata.com/geocode/v1/json` +
            `?q=${encodeURIComponent(query)},India` +
            `&key=${OPENCAGE_API_KEY}` +
            `&limit=1&language=en&no_annotations=1`;

        const res = await fetch(url);

        if (!res.ok) {
            console.warn(`[geocodeAddress] OpenCage returned HTTP ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            console.warn('[geocodeAddress] No results for query:', query);
            return null;
        }

        const { lat, lng } = data.results[0].geometry;
        console.log(`[geocodeAddress] "${query}" → lat=${lat}, lng=${lng}`);
        return { lat, lng };
    } catch (err) {
        console.warn('[geocodeAddress] Geocoding failed:', err.message);
        return null;
    }
}
