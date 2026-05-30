import useLocationStore from '@/store/locationStore';
import { CheckCircle, Loader2, MapPin, Navigation, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const API_KEY = import.meta.env.VITE_OPENCAGE_KEY;


// ✅ Reverse geocode (lat,lng → address)
async function reverseGeocode(lat, lng) {
    const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}&language=en`
    );
    if (!res.ok) throw new Error('Geocoding failed');

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
        throw new Error('No results');
    }
    return data.results[0];
}

// ✅ Forward geocode (search → locations)
async function forwardGeocode(query) {
    const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)},India&key=${API_KEY}&limit=5&language=en`
    );
    if (!res.ok) throw new Error('Search failed');

    const data = await res.json();
    return data.results || [];
}

const LocationModal = ({ isOpen, onClose }) => {
    const { location: savedLocation, setLocation } = useLocationStore();

    const [mode, setMode] = useState('idle');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [gpsError, setGpsError] = useState('');
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode('idle');
            setQuery('');
            setResults([]);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await forwardGeocode(query.trim());
                setResults(data.slice(0, 5));
            } catch {
                setResults([]);
            }
            setSearching(false);
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const handleGPS = () => {
        if (!navigator.geolocation) {
            setGpsError('Your browser does not support location access.');
            setMode('gps-error');
            return;
        }

        setMode('gps-loading');
        setGpsError('');

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    const geo = await reverseGeocode(lat, lng);
                    const addr = geo.components;

                    const pincode = addr.postcode || '';
                    // Granular: village/town (shown in label, too small to match stores)
                    const city =
                        addr.city ||
                        addr.town ||
                        addr.village ||
                        '';
                    // Broader district level — used as fallback for store matching
                    const district =
                        addr.county ||
                        addr.state_district ||
                        addr.city ||
                        '';
                    const suburb =
                        addr.suburb ||
                        addr.neighbourhood ||
                        addr.hamlet ||
                        '';

                    const label =
                        [suburb, city || district].filter(Boolean).join(', ') ||
                        geo.formatted.split(',').slice(0, 2).join(', ');

                    setLocation({ label, pincode, city, district, lat, lng });
                    onClose();
                } catch {
                    setGpsError('Could not detect your location. Try again or enter manually.');
                    setMode('gps-error');
                }
            },
            (err) => {
                const msg =
                    err.code === 1
                        ? 'Location permission denied. Enable it in browser settings.'
                        : 'Could not detect location. Enter manually.';
                setGpsError(msg);
                setMode('gps-error');
            },
            { timeout: 10000 }
        );
    };

    const handleSelect = (result) => {
        const addr = result.components || {};

        const pincode = addr.postcode || '';
        const city =
            addr.city ||
            addr.town ||
            addr.village ||
            '';
        const district =
            addr.county ||
            addr.state_district ||
            addr.city ||
            '';
        const suburb =
            addr.suburb ||
            addr.neighbourhood ||
            addr.hamlet ||
            '';

        const label =
            [suburb, city || district].filter(Boolean).join(', ') ||
            result.formatted.split(',').slice(0, 2).join(', ');

        setLocation({
            label,
            pincode,
            city,
            district,
            lat: result.geometry.lat,
            lng: result.geometry.lng,
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[72px] px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-gray-900 text-base">
                            Select Delivery Location
                        </h2>
                    </div>
                    <button onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* GPS */}
                    <button
                        onClick={handleGPS}
                        disabled={mode === 'gps-loading'}
                        className="w-full flex items-center gap-3 border rounded-xl px-4 py-3"
                    >
                        {mode === 'gps-loading' ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Navigation />
                        )}
                        <span>
                            {mode === 'gps-loading'
                                ? 'Detecting location...'
                                : 'Use my current location'}
                        </span>
                    </button>

                    {mode === 'gps-error' && (
                        <p className="text-red-500 text-xs">{gpsError}</p>
                    )}

                    {/* Search */}
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter area, pincode or city…"
                        className="w-full border rounded-xl px-4 py-3"
                    />

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="border rounded-xl divide-y">
                            {results.map((r) => {
                                const addr = r.components || {};
                                const city =
                                    addr.city ||
                                    addr.town ||
                                    addr.village ||
                                    addr.county ||
                                    '';
                                const suburb =
                                    addr.suburb ||
                                    addr.neighbourhood ||
                                    addr.hamlet ||
                                    '';
                                const pincode = addr.postcode || '';

                                const primary =
                                    [suburb, city].filter(Boolean).join(', ') ||
                                    r.formatted.split(',')[0];

                                return (
                                    <button
                                        key={r.annotations?.geohash || r.formatted}
                                        onClick={() => handleSelect(r)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                    >
                                        <p className="font-medium">{primary}</p>
                                        <p className="text-xs text-gray-500">
                                            {pincode}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Saved */}
                    {savedLocation && (
                        <div className="bg-green-50 border rounded-xl px-4 py-3 flex gap-2">
                            <CheckCircle className="text-green-500 w-4 h-4" />
                            <p className="text-xs">
                                {savedLocation.label} ({savedLocation.pincode})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
