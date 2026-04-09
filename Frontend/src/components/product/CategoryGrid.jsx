import { getCategories } from '@/services/categoryService';
import { CATEGORIES as FALLBACK_CATEGORIES, ROUTES } from '@/utils/constants';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success) {
          setCategories(response.data);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mb-2"></div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`${ROUTES.CATEGORY.replace(':category', category.id)}`}
          className="flex flex-col items-center group"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-[#F8F8F8] rounded-full mb-2 group-hover:shadow-md transition-all duration-300 overflow-hidden text-3xl md:text-4xl">
            {category.icon}
          </div>
          <span className="text-[11px] md:text-xs text-center text-gray-800 font-semibold leading-tight line-clamp-2 px-1">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;
