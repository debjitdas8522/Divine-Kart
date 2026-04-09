import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getOrderById, updateOrderStatus } from '@/services/orderService';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
  });

  const order = orderData?.order;

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus) => updateOrderStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id]);
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

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

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`Are you sure you want to change status to "${newStatus}"?`)) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Button onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-600">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge size="lg" variant={getStatusBadgeVariant(order.status)}>
          {order.status}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-900">{order.user?.name || order.shippingAddress?.name || 'N/A'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Email:</span>{' '}
                <span className="text-gray-900">{order.user?.email || 'N/A'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Phone:</span>{' '}
                <span className="text-gray-900">{order.shippingAddress?.phone || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
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

        {/* Right - Actions & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
            
            <div className="space-y-2">
              {Object.values(ORDER_STATUS).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={order.status === status || updateStatusMutation.isPending}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                    order.status === status
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mark as {status}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment
            </h2>
            
            <div className="space-y-2 mb-4">
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
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
