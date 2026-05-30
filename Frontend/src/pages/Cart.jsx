import { useCart } from '@/hooks/useCart';
import { ROUTES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { Heart, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { items, totalItems, subtotal, deliveryFee, total, updateItemQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  // Calculate total MRP (use mrp field if available, else price)
  const totalMRP = items.reduce((sum, item) => sum + ((item.mrp || item.price) * item.quantity), 0);
  const discountOnMRP = totalMRP - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="w-24 h-24 text-gray-200 mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty!</h2>
        <p className="text-gray-500 mb-8">Add items to it now.</p>
        <Link
          to={ROUTES.HOME}
          className="bg-primary text-white px-8 py-3 rounded font-bold hover:bg-primary-600 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="container-custom py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-5">
          MY SHOPPING CART ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-5 px-5 py-5">
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>

                  {/* Info + Controls */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>

                    {/* Qty stepper */}
                    <div className="flex items-center mt-3 border border-gray-300 rounded w-fit">
                      <button
                        onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Heart className="w-3 h-3" /> Save for Later
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    {(item.mrp || 0) > item.price && (
                      <p className="text-xs text-gray-400 line-through mt-0.5">
                        {formatCurrency(item.mrp * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Details Panel */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Price Details</h2>
              </div>

              <div className="px-5 py-5 space-y-3">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Total MRP</span>
                  <span className="font-semibold">{formatCurrency(totalMRP)}</span>
                </div>

                {discountOnMRP > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Discount on MRP</span>
                    <span className="font-semibold text-green-600">-{formatCurrency(discountOnMRP)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">
                        FREE{' '}
                        <span className="text-gray-400 line-through font-normal text-xs">(₹49)</span>
                      </span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline">
                  <span className="font-black text-gray-900 text-sm">Total Amount</span>
                  <span className="font-black text-gray-900 text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={() => navigate(ROUTES.CHECKOUT)}
                  className="w-full bg-primary text-white py-3 rounded font-bold text-sm uppercase tracking-widest hover:bg-primary-600 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

            {/* Secure badge */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">🔒 100% Secure Payments</p>
              <p className="text-xs text-gray-400 mt-1">Easy returns. 100% Authentic Products.</p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Safe and Secure Payments. Easy returns. 100% Authentic Products.
        </p>
      </div>
    </div>
  );
};

export default Cart;
