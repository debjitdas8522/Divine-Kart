import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getOrderById } from '@/services/orderService';
import { ORDER_STATUS, ROUTES } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Package, Store, Truck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
  });

  const order = orderData?.order;

  const getStatusBadgeVariant = (status) => {
    const variants = {
      [ORDER_STATUS.PENDING]: 'warning',
      [ORDER_STATUS.PROCESSING]: 'info',
      [ORDER_STATUS.CONFIRMED]: 'info',
      [ORDER_STATUS.SHIPPED]: 'primary',
      [ORDER_STATUS.DELIVERED]: 'success',
      [ORDER_STATUS.CANCELLED]: 'danger',
    };
    return variants[status] || 'default';
  };

  const orderSteps = [
    { status: ORDER_STATUS.CONFIRMED, icon: CheckCircle, label: 'Confirmed' },
    { status: ORDER_STATUS.PROCESSING, icon: Package, label: 'Processing' },
    { status: ORDER_STATUS.SHIPPED, icon: Truck, label: 'Shipped' },
    { status: ORDER_STATUS.DELIVERED, icon: CheckCircle, label: 'Delivered' },
  ];

  const getCurrentStepIndex = () => {
    return orderSteps.findIndex(step => step.status === order?.status);
  };

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Button onClick={() => navigate(ROUTES.ORDERS)}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(ROUTES.ORDERS)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDateTime(order.createdAt)}
            </p>
            {order.store && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-sm text-gray-500">
                  Fulfilled by{' '}
                  <strong className="text-gray-700">
                    {order.store?.name ?? 'Local Store'}
                  </strong>
                </p>
              </div>
            )}
          </div>
          <Badge size="lg" variant={getStatusBadgeVariant(order.status)}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracking */}
          {order.status !== ORDER_STATUS.CANCELLED && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Tracking</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-5 w-0.5 h-[calc(100%-2.5rem)] bg-gray-200">
                  <div
                    className="bg-primary transition-all duration-500"
                    style={{
                      height: currentStepIndex >= 0
                        ? `${(currentStepIndex / (orderSteps.length - 1)) * 100}%`
                        : '0%'
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="relative space-y-8">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.status} className="flex items-start">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gray-600 mt-1">
                              {step.status === ORDER_STATUS.DELIVERED ? 'Completed!' : 'In progress'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h2>
            
            {order.shippingAddress && (
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  {order.shippingAddress.name}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  {order.shippingAddress.addressLine}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-gray-600 text-sm">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Method</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge size="sm" variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                  {order.paymentStatus || 'Pending'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(order.totalAmount - (order.deliveryFee || 0))}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold text-gray-900">
                  {order.deliveryFee ? formatCurrency(order.deliveryFee) : 'FREE'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => navigate(ROUTES.HOME)}>
              Continue Shopping
            </Button>
            {order.status === ORDER_STATUS.DELIVERED && (
              <Button variant="primary" className="w-full">
                Download Invoice
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
