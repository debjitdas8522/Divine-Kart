import { useCart } from '@/hooks/useCart';
import { ROUTES } from '@/utils/constants';
import { calculateDiscountPercentage, formatCurrency } from '@/utils/formatters';
import { Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { items, addItem, updateItemQuantity } = useCart();

  const cartItem = items.find(item => item.productId === product._id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateItemQuantity(product._id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) updateItemQuantity(product._id, quantity - 1);
  };

  const discountPercent = (product.OldPrice || product.mrp || 0) > product.price
    ? calculateDiscountPercentage(product.OldPrice || product.mrp, product.price)
    : 0;

  return (
    <Link
      to={`${ROUTES.PRODUCT_DETAIL.replace(':id', product._id)}`}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-accent-red text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {discountPercent}% OFF
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 ? (
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Out of Stock
          </div>
        ) : product.stock <= 5 ? (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Only {product.stock} left
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2 mb-1 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Weight/Size */}
        {product.weight && (
          <p className="text-[10px] text-gray-500 mb-2">{product.weight}</p>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto mb-2">
          <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
          {(product.OldPrice || product.mrp || 0) > product.price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatCurrency(product.OldPrice || product.mrp)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-accent-red">{discountPercent}% OFF</span>
          )}
        </div>

        {/* ADD TO CART / Qty Controls — full width like Stitch design */}
        {product.stock === 0 ? (
          <button
            disabled
            className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded border border-gray-200 cursor-not-allowed uppercase tracking-wide"
          >
            Out of Stock
          </button>
        ) : quantity === 0 ? (
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-white border-2 border-primary text-primary text-xs font-bold rounded hover:bg-primary hover:text-white transition-colors uppercase tracking-wide"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center bg-primary text-white rounded overflow-hidden">
            <button
              onClick={handleDecrement}
              className="px-3 py-2 hover:bg-primary-600 transition-colors font-bold text-sm"
            >
              −
            </button>
            <span className="flex-1 text-center text-sm font-bold">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="px-3 py-2 hover:bg-primary-600 transition-colors font-bold text-sm"
            >
              +
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
