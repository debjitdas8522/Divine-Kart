import CategoryGrid from '@/components/product/CategoryGrid';
import ProductRow from '@/components/product/ProductRow';
import { getProducts } from '@/services/productService';
import { getPersonalizedRecommendations, getPopularProducts } from '@/services/aiService';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, TrendingUp } from 'lucide-react';

const Home = () => {
  const { isAuthenticated: isLoggedIn } = useAuth();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ limit: 30 }),
  });

  // Personalized recommendations (if logged in) or popular products (if guest)
  const { data: recommendedData, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations', isLoggedIn ? 'personalized' : 'popular'],
    queryFn: () => isLoggedIn ? getPersonalizedRecommendations(10) : getPopularProducts(10),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || [];
  const recommendedProducts = recommendedData?.recommendations || recommendedData?.products || [];

  // Categorize products for different rows
  const agarbatti = products.filter(p => (p.category?.name || p.category || '').toLowerCase().includes('agarbatti') || (p.category?.name || p.category || '').toLowerCase().includes('dhoop')).slice(0, 10);
  const diya = products.filter(p => (p.category?.name || p.category || '').toLowerCase().includes('diya') || (p.category?.name || p.category || '').toLowerCase().includes('oil')).slice(0, 10);
  const samagri = products.filter(p => !agarbatti.includes(p) && !diya.includes(p)).slice(0, 12);

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
            <ProductRow
              title=""
              products={recommendedProducts}
              isLoading={recsLoading}
            />
          </section>
        )}

        {/* Agarbatti & Dhoop Row */}
        <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
          <ProductRow 
            title="Agarbatti & Dhoop" 
            products={agarbatti} 
            isLoading={isLoading} 
            viewAllRoute="/category/agarbatti" 
          />
        </section>

        {/* Diya & Oil Row */}
        <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
          <ProductRow 
            title="Diya, Oil & Wicks" 
            products={diya} 
            isLoading={isLoading} 
            viewAllRoute="/category/diya" 
          />
        </section>

        {/* Pujan Samagri Row */}
        <section className="bg-white rounded-2xl p-1 md:p-4 shadow-sm border border-gray-100">
          <ProductRow 
            title="Pujan Samagri Essentials" 
            products={samagri} 
            isLoading={isLoading} 
            viewAllRoute="/category/samagri" 
          />
        </section>
      </div>
    </div>
  );
};

export default Home;
