import Badge from '@/components/ui/Badge';
import { useCart } from '@/hooks/useCart';
import { getProductById } from '@/services/productService';
import { getSimilarProducts, getFrequentlyBoughtTogether } from '@/services/aiService';
import { calculateDiscountPercentage, formatCurrency } from '@/utils/formatters';
import { CATEGORIES, ROUTES } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, ShieldCheck, Sparkles, ShoppingBasket, Star, Truck, Zap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

// ─── Small product card for AI rows ──────────────────────────────────────────
const MiniProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className="h-24 bg-gray-50 flex items-center justify-center p-2">
        <img
          src={product.imageUrl || '/placeholder.png'}
          alt={product.name}
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-2">
        <p className="text-[11px] font-black text-gray-800 leading-tight line-clamp-2 mb-1">{product.name}</p>
        <p className="text-xs font-black text-primary">{formatCurrency(product.price)}</p>
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="mt-1.5 w-full text-[10px] font-black bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-lg py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? 'Add' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
};

// ─── Horizontal scroll row ────────────────────────────────────────────────────
const HorizontalProductRow = ({ title, icon: Icon, products, isLoading }) => {
  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 h-44 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {products.map((product) => (
            <MiniProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

// Category cover images from Unsplash
const CATEGORY_IMAGES = {
  agarbatti: 'https://images.unsplash.com/photo-1602738328654-51ab2ae6c4ff?w=200&q=80',
  murti:     'https://images.unsplash.com/photo-1561361058-c24e1b6fe3f6?w=200&q=80',
  diya:      'https://images.unsplash.com/photo-1604423973589-1dd8eaae7c07?w=200&q=80',
  samagri:   'https://images.unsplash.com/photo-1600267204026-785c12ca62c8?w=200&q=80',
  flowers:   'https://images.unsplash.com/photo-1490750967868-88df5691cc1e?w=200&q=80',
  books:     'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80',
  vessels:   'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=200&q=80',
  decor:     'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=200&q=80',
};

const CATEGORY_PRICES = {
  agarbatti: 150, murti: 450, diya: 220, samagri: 180,
  flowers: 80, books: 250, vessels: 350, decor: 500,
};

// ─── Related Category Card (Stitch "Related Sacred Items" row) ────────────────
const RelatedCategoryCard = ({ category }) => (
  <Link
    to={`/category/${category.id}`}
    className="flex-shrink-0 w-28 text-center group"
  >
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group-hover:shadow-md transition-all">
      {CATEGORY_IMAGES[category.id] ? (
        <img
          src={CATEGORY_IMAGES[category.id]}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-3xl">{category.icon}</div>
      )}
    </div>
    <p className="text-xs font-semibold text-gray-800 mt-1.5 leading-tight">{category.name}</p>
    <p className="text-xs text-primary font-bold">₹{CATEGORY_PRICES[category.id] || 150}</p>
  </Link>
);

// ─── Star rating display ──────────────────────────────────────────────────────
const StarRating = ({ rating = 4.5, count = 124 }) => (
  <div className="flex items-center gap-2">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
    <span className="text-sm text-gray-500">{count} reviews</span>
  </div>
);

// ─── Main ProductDetail ───────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const { items, addItem, updateItemQuantity } = useCart();
  const [selectedThumb, setSelectedThumb] = useState(0);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
  });

  const { data: similarData, isLoading: similarLoading } = useQuery({
    queryKey: ['similar', id],
    queryFn: () => getSimilarProducts(id, 6),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const { data: fbtData, isLoading: fbtLoading } = useQuery({
    queryKey: ['fbt', id],
    queryFn: () => getFrequentlyBoughtTogether(id, 6),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const product = productData?.data;
  const cartItem = items.find(item => item.productId === id);
  const quantity = cartItem?.quantity || 0;

  const similarProducts = similarData?.products || [];
  const fbtProducts = fbtData?.products || [];

  // Build thumbnail list (main image + any extras)
  const allImages = product
    ? [product.imageUrl, ...(product.images || [])].filter(Boolean)
    : [];
  const displayImage = allImages[selectedThumb] || allImages[0] || '/placeholder.png';

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || product.images?.[0],
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  const handleIncrement = () => updateItemQuantity(product._id, quantity + 1);
  const handleDecrement = () => { if (quantity > 0) updateItemQuantity(product._id, quantity - 1); };

  if (isLoading) {
    return (
      <div className="container-custom py-10">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="h-96 bg-gray-100 rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="h-8 bg-gray-100 rounded-xl w-3/4" />
            <div className="h-5 bg-gray-100 rounded-xl w-1/2" />
            <div className="h-10 bg-gray-100 rounded-xl w-1/3 mt-6" />
            <div className="h-12 bg-gray-100 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-12 text-center">
        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500 font-semibold">Product not found</p>
        <Link to="/" className="text-primary font-bold mt-4 inline-block hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const discountPercent = (product.OldPrice || product.mrp) > product.price
    ? calculateDiscountPercentage(product.OldPrice || product.mrp, product.price)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      {/* Breadcrumb */}
      <div className="container-custom pt-4 pb-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="container-custom py-4 space-y-5">
        {/* Main product card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">

            {/* ── Image Panel with thumbnail strip ── */}
            <div className="border-b md:border-b-0 md:border-r border-gray-100 p-6 flex gap-3">
              {/* Vertical thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {allImages.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedThumb(i)}
                      className={`w-14 h-14 border-2 rounded overflow-hidden flex-shrink-0 transition-all ${
                        selectedThumb === i ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 flex items-center justify-center min-h-[300px] relative">
                {discountPercent > 0 && (
                  <div className="absolute top-2 right-2 bg-accent-red text-white text-xs font-bold px-2 py-1 rounded">
                    {discountPercent}% OFF
                  </div>
                )}
                <img
                  src={displayImage}
                  alt={product.name}
                  className="max-h-72 w-full object-contain"
                />
              </div>
            </div>

            {/* ── Details Panel ── */}
            <div className="p-6 flex flex-col gap-4">
              {/* Category label */}
              {product.category && (
                <span className="text-xs font-black text-primary uppercase tracking-widest">
                  {product.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              {/* Star rating */}
              <StarRating rating={product.rating || 4.5} count={product.reviewCount || 124} />

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {(product.OldPrice || product.mrp) > product.price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatCurrency(product.OldPrice || product.mrp)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-accent-red bg-red-50 px-2 py-0.5 rounded">
                    {discountPercent}% OFF
                  </span>
                )}
                <span className="text-3xl font-black text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              )}

              {/* Delivery info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Delivery in 10 mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Truck className="w-4 h-4" />
                  <span className="font-semibold">Free shipping for orders over ₹500</span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="mt-2">
                {product.stock > 0 ? (
                  quantity === 0 ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-white py-3.5 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-primary text-white rounded-xl overflow-hidden shadow-lg shadow-primary/20">
                        <button onClick={handleDecrement} className="px-5 py-3.5 hover:bg-primary-600 transition-colors text-lg font-black">−</button>
                        <span className="px-6 text-xl font-black tabular-nums">{quantity}</span>
                        <button onClick={handleIncrement} className="px-5 py-3.5 hover:bg-primary-600 transition-colors text-lg font-black">+</button>
                      </div>
                      <span className="text-sm font-bold text-gray-500">in cart</span>
                    </div>
                  )
                ) : (
                  <button disabled className="w-full bg-gray-100 text-gray-400 py-3.5 rounded-lg font-black text-sm uppercase tracking-widest cursor-not-allowed">
                    Out of Stock
                  </button>
                )}
              </div>

              {/* Trust grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black text-gray-800">Fast Delivery</p>
                    <p className="text-[10px] text-gray-500">2-3 Business Days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black text-gray-800">Authentic</p>
                    <p className="text-[10px] text-gray-500">100% Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Sacred Items (category cards) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">✦</span>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">Related Sacred Items</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <RelatedCategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* AI Recommendation Rows */}
        <HorizontalProductRow
          title="Frequently Bought Together"
          icon={ShoppingBasket}
          products={fbtProducts}
          isLoading={fbtLoading}
        />

        <HorizontalProductRow
          title="Similar Products"
          icon={Sparkles}
          products={similarProducts}
          isLoading={similarLoading}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
