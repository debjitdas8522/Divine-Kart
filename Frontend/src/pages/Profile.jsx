import AddressForm from '@/components/checkout/AddressForm';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { deleteAddress, getAddresses } from '@/services/addressService';
import { logout as logoutService } from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit2, LogOut, MapPin, Plus, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch addresses
  const { data: addressesData, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const addresses = addressesData?.data || [];

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success('Address deleted');
    },
    onError: () => {
      toast.error('Failed to delete address');
    },
  });

  const handleLogout = async () => {
    try {
      await logoutService();
      logout();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(ROUTES.ORDERS)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                My Orders
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Account Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <Badge variant="primary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saved Addresses</span>
                <Badge variant="default">{addresses.length}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Addresses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Saved Addresses
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            </div>

            {loadingAddresses ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 skeleton rounded-lg" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No saved addresses
                </h3>
                <p className="text-gray-600 mb-6">
                  Add an address to make checkout faster
                </p>
                <Button onClick={() => setShowAddressModal(true)}>
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-hover transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {address.name}
                        </span>
                        <Badge size="sm" variant="default">
                          {address.type}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setShowAddressModal(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="p-1.5 hover:bg-red-50 rounded"
                        >
                          <span className="text-red-600 text-lg">×</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {address.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="lg"
      >
        <AddressForm
          address={editingAddress}
          onSuccess={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          onCancel={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Profile;
