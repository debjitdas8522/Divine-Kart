import ProductCard from '@/components/product/ProductCard';
import { getCategories } from '@/services/categoryService';
import { getProductsByCategory } from '@/services/productService';
import { CATEGORIES } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default Order' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'name', label: 'Name: A → Z' },
];

// Collapsible filter group
const FilterGroup = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-gray-800 mb-2"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

// Sidebar / filter panel (shared between drawer + desktop)
const FilterPanel = ({ category, minPrice, maxPrice, setMinPrice, setMaxPrice, onApply, onClear }) => (
  <div className="space-y-0">
    <FilterGroup title="Price Range">
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        onClick={onApply}
        className="w-full bg-primary text-white rounded py-1.5 text-xs font-bold hover:bg-primary-600 transition-colors"
      >
        Apply
      </button>
    </FilterGroup>

    <FilterGroup title="Brand">
      <div className="space-y-2">
        {['Divine-Kart', 'Cycle', 'Hem', 'Satya'].map(b => (
          <label key={b} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded text-primary focus:ring-primary" />
            {b}
          </label>
        ))}
      </div>
    </FilterGroup>

    {(category === 'agarbatti') && (
      <FilterGroup title="Scent">
        <div className="space-y-2">
          {['Rose', 'Sandalwood', 'Jasmine', 'Lavender', 'Mogra'].map(s => (
            <label key={s} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded text-primary" />
              {s}
            </label>
          ))}
        </div>
      </FilterGroup>
    )}

    <FilterGroup title="Type" defaultOpen={false}>
      <div className="space-y-2">
        {['Agarbatti', 'Dhoop Cones', 'Dhoop Sticks', 'Sambrani'].map(t => (
          <label key={t} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded text-primary" />
            {t}
          </label>
        ))}
      </div>
    </FilterGroup>
  </div>
);

const Category = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const sortBy = searchParams.get('sort') || 'default';

  // Fetch category metadata
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const categories = categoriesData?.data || CATEGORIES;
  const categoryInfo = categories.find(c => c.id === category);

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'category', category, sortBy, minPrice, maxPrice],
    queryFn: () => getProductsByCategory(category, {
      sort: sortBy !== 'default' ? sortBy : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    }),
  });

  let products = productsData?.products || [];
  if (sortBy === 'price_low') products = [...products].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_high') products = [...products].sort((a, b) => b.price - a.price);
  else if (sortBy === 'name') products = [...products].sort((a, b) => a.name.localeCompare(b.name));

  const handleSortChange = (value) => {
    if (value === 'default') searchParams.delete('sort');
    else searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const applyPriceFilter = () => setSearchParams(prev => {
    if (minPrice) prev.set('minPrice', minPrice); else prev.delete('minPrice');
    if (maxPrice) prev.set('maxPrice', maxPrice); else prev.delete('maxPrice');
    return new URLSearchParams(prev);
  });

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container-custom py-6">

        {/* Page heading */}
        <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight flex items-center gap-2 mb-1">
          {categoryInfo?.icon && <span>{categoryInfo.icon}</span>}
          {categoryInfo?.name || category}
        </h1>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          {products.length} Products Available
        </p>

        {/* ── Top toolbar: FILTERS toggle + sort dropdown ── */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 mb-5">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            FILTERS
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold hidden sm:block">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value)}
              className="text-xs font-bold text-gray-700 uppercase tracking-wide bg-transparent border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Expandable filter panel (horizontal drawer) ── */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-gray-700 uppercase tracking-wider">Filters</span>
              <div className="flex items-center gap-4">
                <button onClick={clearAllFilters} className="text-xs text-primary font-bold hover:underline">
                  Clear All
                </button>
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Horizontal grid of filter groups */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Price Range</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button onClick={applyPriceFilter} className="w-full bg-primary text-white rounded py-1 text-xs font-bold hover:bg-primary-600 transition-colors">
                  Apply
                </button>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Brand</p>
                <div className="space-y-1.5">
                  {['Divine-Kart', 'Cycle', 'Hem', 'Satya'].map(b => (
                    <label key={b} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary" /> {b}
                    </label>
                  ))}
                </div>
              </div>
              {category === 'agarbatti' && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Scent</p>
                  <div className="space-y-1.5">
                    {['Rose', 'Sandalwood', 'Jasmine', 'Lavender', 'Mogra'].map(s => (
                      <label key={s} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary" /> {s}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Type</p>
                <div className="space-y-1.5">
                  {['Agarbatti', 'Dhoop Cones', 'Dhoop Sticks', 'Sambrani'].map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary" /> {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Product Grid (full width, 3-4 cols like Stitch) ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton rounded" />
                  <div className="h-3 skeleton rounded w-2/3" />
                  <div className="h-8 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <p className="text-gray-500 font-semibold mb-1">No products found</p>
            <p className="text-xs text-gray-400 mb-4">Try adjusting your filters</p>
            <button onClick={clearAllFilters} className="text-primary text-sm font-bold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
