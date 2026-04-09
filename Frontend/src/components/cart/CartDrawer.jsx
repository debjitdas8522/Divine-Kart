import { useCart } from '@/hooks/useCart';
import useUIStore from '@/store/uiStore';
import { ROUTES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, subtotal, deliveryFee, total, updateItemQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    closeCartDrawer();
    navigate(ROUTES.CHECKOUT);
  };

  if (!isCartDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeCartDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            My Cart ({items.length} items)
          </h2>
          <button
            onClick={closeCartDrawer}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-6">
              Add items to get started
            </p>
            <button
              onClick={closeCartDrawer}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3"
                >
                  {/* Image */}
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {item.quantity === 1 ? (
                        <X className="w-4 h-4 text-red-500" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Price Summary */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {/* Delivery Fee */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
