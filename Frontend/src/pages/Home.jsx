import CategoryGrid from '@/components/product/CategoryGrid';
import ProductRow from '@/components/product/ProductRow';
import { getProductsByStoreIds } from '@/services/productService';
import { getNearbyStores } from '@/services/storeService';
import { getPersonalizedRecommendations, getPopularProducts } from '@/services/aiService';
import useLocationStore from '@/store/locationStore';
import useUIStore from '@/store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Clock, MapPin, Navigation, PackageX, Sparkles, Store, TrendingUp } from 'lucide-react';

// ─── No-Location Banner ──────────────────────────────────────────────────────
const NoLocationBanner = ({ onOpenLocation }) => (
  <div className="mx-4 md:mx-0 my-4 rounded-2xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
    <div className="flex flex-col items-center text-center px-6 py-10 gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shadow-inner">
        <MapPin className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h2 className="text-lg font-black text-gray-900">Where should we deliver?</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
          Set your delivery location to check if we serve your area and show available products.
        </p>
      </div>
      <button
        id="set-location-btn"
        onClick={onOpenLocation}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
      >
        <Navigation className="w-4 h-4" />
        Set Delivery Location
      </button>
    </div>
  </div>
);

// ─── No-Stores Banner ────────────────────────────────────────────────────────
const NoStoresBanner = ({ location, onOpenLocation }) => (
  <div className="mx-4 md:mx-0 my-4 rounded-2xl overflow-hidden border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
    <div className="flex flex-col items-center text-center px-6 py-10 gap-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-inner">
        <PackageX className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-black text-gray-900">Not available in your area yet</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
          We couldn't find any active stores near{' '}
          <span className="font-semibold text-gray-700">{location?.label || 'your location'}</span>.
          {' '}We're expanding soon!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          id="change-location-btn"
          onClick={onOpenLocation}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <MapPin className="w-4 h-4" />
          Try a different location
        </button>
      </div>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {location?.label}{location?.pincode ? ` · ${location.pincode}` : ''}
      </p>
    </div>
  </div>
);

// ─── Nearby Stores Status Card ──────────────────────────────────────────────
const NearbyStoresStatus = ({ stores, location }) => {
  const onlineStores  = stores.filter(s => s.isActive !== false);
  const offlineStores = stores.filter(s => s.isActive === false);

  if (stores.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Store className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-[900] text-gray-900 uppercase tracking-widest">Nearby Stores</h2>
            <p className="text-[10px] text-gray-400 font-bold">
              Delivering to {location?.label || 'your area'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onlineStores.length > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              {onlineStores.length} Online
            </span>
          )}
          {offlineStores.length > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              {offlineStores.length} Offline
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stores.map((store) => {
          const isOnline = store.isActive !== false;
          return (
            <div
              key={store._id}
              className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                isOnline
                  ? 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm'
                  : 'bg-gray-50/60 border-gray-100 opacity-70'
              }`}
            >
              {/* Store Logo */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden ${
                isOnline ? 'bg-amber-50 border-amber-100' : 'bg-gray-100 border-gray-200'
              }`}>
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className={`w-full h-full object-cover ${!isOnline ? 'grayscale' : ''}`} />
                ) : (
                  <Store className={`w-5 h-5 ${isOnline ? 'text-amber-400' : 'text-gray-300'}`} />
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mt-0.5">
                  {store.address?.city && (
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      {store.address.city}
                    </span>
                  )}
                  {store.openingHours?.open && store.openingHours?.close && (
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      {store.openingHours.open}–{store.openingHours.close}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                <span className="relative flex h-1.5 w-1.5">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                </span>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          );
        })}
      </div>

      {offlineStores.length > 0 && onlineStores.length > 0 && (
        <p className="text-[10px] text-gray-400 text-center mt-3 font-semibold">
          Offline stores are not accepting orders right now. Products shown are from online stores only.
        </p>
      )}
      {onlineStores.length === 0 && offlineStores.length > 0 && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
          <p className="text-xs font-bold text-amber-700">
            All nearby stores are currently offline. Please check back later!
          </p>
        </div>
      )}
    </section>
  );
};

// ─── Home ────────────────────────────────────────────────────────────────────
const Home = () => {
  const { isAuthenticated: isLoggedIn } = useAuth();
  const { location } = useLocationStore();
  const openLocationModal = useUIStore((s) => s.openLocationModal);

  // Check for nearby stores based on saved location
  const {
    data: nearbyData,
    isLoading: storesLoading,
  } = useQuery({
    queryKey: ['nearby-stores', location?.lat, location?.lng, location?.pincode, location?.city, location?.district],
    // Pass ALL available location signals so the backend can try geo → pincode → city → district
    queryFn: () => getNearbyStores(
      location?.lat || null,
      location?.lng || null,
      10,
      location?.pincode || null,
      location?.city || location?.district || null,   // prefer city, fall back to district
      location?.district || null,
    ),
    enabled: !!(location?.lat || location?.pincode || location?.city || location?.district),
    staleTime: 2 * 60 * 1000,
  });

  const nearbyStores = nearbyData?.data ?? [];
  // Only online stores should show products
  const onlineStores = nearbyStores.filter(s => s.isActive !== false);
  const hasNearbyStores = nearbyStores.length > 0;
  const hasOnlineStores = onlineStores.length > 0;

  // Derive nearby store IDs — only online stores
  const nearbyStoreIds = onlineStores.map(s => s._id);

  // Fetch products ONLY from nearby ONLINE vendor stores (not the global admin catalog)
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['vendor-products', nearbyStoreIds.join(',')],
    queryFn: () => getProductsByStoreIds(nearbyStoreIds, { limit: 60 }),
    enabled: nearbyStoreIds.length > 0,
  });

  const { data: recommendedData, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations', isLoggedIn ? 'personalized' : 'popular'],
    queryFn: () => isLoggedIn ? getPersonalizedRecommendations(10) : getPopularProducts(10),
    staleTime: 5 * 60 * 1000,
    enabled: hasOnlineStores,
  });

  const products = productsData?.products || [];
  const recommendedProducts = recommendedData?.recommendations || recommendedData?.products || [];

  const agarbatti = products.filter(p => (p.category?.name || p.category || '').toLowerCase().includes('agarbatti') || (p.category?.name || p.category || '').toLowerCase().includes('dhoop')).slice(0, 10);
  const diya = products.filter(p => (p.category?.name || p.category || '').toLowerCase().includes('diya') || (p.category?.name || p.category || '').toLowerCase().includes('oil')).slice(0, 10);
  const samagri = products.filter(p => !agarbatti.includes(p) && !diya.includes(p)).slice(0, 12);

  // Determine what to render in the products area
  const renderProductArea = () => {
    // No location selected yet
    if (!location) {
      return <NoLocationBanner onOpenLocation={openLocationModal} />;
    }

    // Still checking for stores
    if (storesLoading) {
      return (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Checking availability in your area…</span>
        </div>
      );
    }

    // No stores found nearby (neither online nor offline)
    if (!hasNearbyStores) {
      return <NoStoresBanner location={location} onOpenLocation={openLocationModal} />;
    }

    // Stores found — show vendor status + products
    return (
      <>

        {/* Product sections — only if online stores exist */}
        {hasOnlineStores ? (
          <>
            {/* AI Recommendations Row */}
            {(recsLoading || recommendedProducts.length > 0) && (
              <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 md:px-0 md:pt-0">
                  {isLoggedIn
                    ? <Sparkles className="w-4 h-4 text-primary" />
                    : <TrendingUp className="w-4 h-4 text-primary" />
                  }
                  <span className="text-xs font-black text-primary uppercase tracking-widest">
                    {isLoggedIn ? 'Recommended For You' : 'Trending Now'}
                  </span>
                </div>
                <ProductRow title="" products={recommendedProducts} isLoading={recsLoading} />
              </section>
            )}

            {/* Agarbatti & Dhoop Row */}
            <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
              <ProductRow title="Agarbatti & Dhoop" products={agarbatti} isLoading={isLoading} viewAllRoute="/category/agarbatti" />
            </section>

            {/* Diya & Oil Row */}
            <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
              <ProductRow title="Diya, Oil & Wicks" products={diya} isLoading={isLoading} viewAllRoute="/category/diya" />
            </section>

            {/* Puja Samagri Row */}
            <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
              <ProductRow title="Puja Samagri Essentials" products={samagri} isLoading={isLoading} viewAllRoute="/category/samagri" />
            </section>
          </>
        ) : (
          <div className="mx-4 md:mx-0 my-4 rounded-2xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
            <div className="flex flex-col items-center text-center px-6 py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shadow-inner">
                <Store className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Your nearby store is offline</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  The store in your area is currently not accepting orders. Please check back later!
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-4">
      {/* Promotional Banners */}
      <section className="container-custom py-2 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="aspect-[21/9] md:aspect-[16/7] rounded-2xl overflow-hidden bg-primary-100 relative group">
             <img src="/puja_banner.png" alt="Divine Puja Essentials" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>
          <div className="hidden md:block aspect-[16/7] rounded-2xl overflow-hidden bg-accent-yellow/20 relative group">
             <img src="https://img.freepik.com/free-vector/food-delivery-courier-service-banner-flat-design_23-2148590675.jpg" alt="Promo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="hidden lg:block aspect-[16/7] rounded-2xl overflow-hidden bg-accent-red/10 relative group">
             <img src="https://img.freepik.com/free-vector/supermarket-banner-template_23-2148501251.jpg" alt="Promo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      <div className="container-custom space-y-2 md:space-y-4 pb-12">
        {/* Horizontal Category Grid */}
        <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <CategoryGrid />
        </section>

        {/* Product Area — gated by location & nearby stores */}
        {renderProductArea()}
      </div>
    </div>
  );
};

export default Home;
