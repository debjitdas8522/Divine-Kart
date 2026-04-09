import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductRow = ({ title, products, isLoading, viewAllRoute }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <div className="h-6 w-48 skeleton rounded" />
        </div>
        <div className="flex gap-4 overflow-x-hidden px-4 pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[150px] md:w-[180px] flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded" />
                <div className="h-5 skeleton rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between px-4 md:px-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
          {title}
        </h2>
        {viewAllRoute && (
          <Link 
            to={viewAllRoute}
            className="text-primary text-sm font-bold flex items-center hover:underline"
          >
            see all
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        )}
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-4 md:px-0 pb-4 snap-x">
        {products.map((product) => (
          <div key={product._id} className="w-[160px] md:w-[200px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProductRow;
