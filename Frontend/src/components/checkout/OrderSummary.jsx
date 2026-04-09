import { DELIVERY_CONFIG } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';

const OrderSummary = ({ 
  subtotal = 0, 
  deliveryFee = 0, 
  discount = 0, 
  itemCount = 0,
  showBreakdown = true 
}) => {
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

      <div className="space-y-3">
        {/* Item Count */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Items ({itemCount})</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Delivery Fee */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery Fee</span>
          <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
          </span>
        </div>

        {/* Free Delivery Message */}
        {showBreakdown && deliveryFee > 0 && subtotal < DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              Add {formatCurrency(DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD - subtotal)} more to get FREE delivery!
            </p>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-semibold">- {formatCurrency(discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-3">
          {/* Total */}
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Savings */}
        {discount > 0 && (
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium text-center">
              🎉 You saved {formatCurrency(discount)} on this order!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
