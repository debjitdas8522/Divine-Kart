import AddressForm from '@/components/checkout/AddressForm';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { deleteAddress, getAddresses } from '@/services/addressService';
import { logout as logoutService, updateProfile } from '@/services/authService';
import { getOrders } from '@/services/orderService';
import { ROUTES } from '@/utils/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit2,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, setUser } = useAuth();

  // Active sidebar tab
  const [activeTab, setActiveTab] = useState('settings');

  // Modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Refs for scrolling
  const addressesRef = useRef(null);

  // Fetch addresses
  const { data: addressesData, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });
  const addresses = addressesData?.data || [];

  // Fetch recent orders
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', { limit: 3 }],
    queryFn: () => getOrders({ limit: 3 }),
  });
  const orders = ordersData?.data || [];

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
    onError: () => {
      toast.error('Failed to delete address');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setUser({ ...user, name: editName, phone: editPhone, email: editEmail });
      toast.success('Profile updated successfully!');
      setShowEditProfileModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
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

  const handleEditProfile = (e) => {
    e.preventDefault();
    const updates = {};
    if (editName) updates.name = editName;
    if (editPhone) updates.phone = editPhone;
    if (editEmail) updates.email = editEmail;
    updateProfileMutation.mutate(updates);
  };

  const openEditProfile = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    // Don't pre-fill temp emails
    const isTempMail = user?.email?.includes('.temp') || user?.email?.includes('divinekart.temp');
    setEditEmail(isTempMail ? '' : (user?.email || ''));
    setShowEditProfileModal(true);
  };

  // Determine if the email is a temporary/auto-generated email
  const isTempEmail = user?.email?.includes('.temp') || user?.email?.includes('divinekart.temp') || !user?.email;
  const displayEmail = isTempEmail ? null : user?.email;

  // Sidebar nav items — My Orders and Saved Addresses navigate/scroll, Account Settings is current view
  const sidebarItems = [
    {
      id: 'orders',
      label: 'My Orders',
      icon: ShoppingBag,
      onClick: () => navigate(ROUTES.ORDERS),
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
      onClick: () => {
        setActiveTab('addresses');
        addressesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: Settings,
      onClick: () => setActiveTab('settings'),
    },
  ];

  return (
    <div className="container-custom py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Badge variant="success" size="lg" className="profile-active-badge">
          Active Member
        </Badge>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* ═══════ LEFT SIDEBAR ═══════ */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Card */}
          <div className="profile-sidebar-card">
            <div className="profile-sidebar-header">
              <h2 className="profile-sidebar-title">Divine-Kart Account</h2>
              <p className="profile-sidebar-subtitle">Manage your sacred purchases</p>
            </div>
            <nav className="profile-sidebar-nav">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`profile-sidebar-link ${activeTab === item.id ? 'profile-sidebar-link--active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="profile-sidebar-link profile-sidebar-link--danger"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* ═══════ MAIN CONTENT ═══════ */}
        <div className="lg:col-span-3 space-y-6">
          {/* ──── PROFILE CARD + ACCOUNT STATS ROW ──── */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="profile-info-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="profile-user-info">
                  <h2 className="profile-user-name">{user?.name || 'New User'}</h2>
                  {displayEmail ? (
                    <p className="profile-user-email">{displayEmail}</p>
                  ) : (
                    <button
                      onClick={openEditProfile}
                      className="profile-add-email-btn"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Add your email
                    </button>
                  )}
                  {user?.phone && (
                    <p className="profile-user-phone">
                      <Phone className="w-3.5 h-3.5" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={openEditProfile}
              >
                Edit Profile
              </Button>
            </div>

            {/* Account Stats */}
            <div className="profile-stats-card">
              <h3 className="profile-stats-title">Account Stats</h3>
              <div className="profile-stats-list">
                <div className="profile-stat-item">
                  <div className="profile-stat-label">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span>Total Orders</span>
                  </div>
                  <span className="profile-stat-badge profile-stat-badge--primary">
                    {orders.length || 0}
                  </span>
                </div>
                <div className="profile-stat-item">
                  <div className="profile-stat-label">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>Saved Addresses</span>
                  </div>
                  <span className="profile-stat-badge profile-stat-badge--default">
                    {addresses.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ──── SAVED ADDRESSES SECTION ──── */}
          <div ref={addressesRef} className="profile-section-card">
            <div className="profile-section-header">
              <h2 className="profile-section-title">
                <MapPin className="w-5 h-5" />
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 skeleton rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((address) => (
                  <div key={address._id} className="profile-address-card">
                    <div className="profile-address-top">
                      <div className="profile-address-badges">
                        <span className="profile-address-type-badge">
                          {address.type?.toUpperCase() || 'HOME'}
                        </span>
                        {address.isDefault && (
                          <span className="profile-address-default-badge">Default</span>
                        )}
                      </div>
                      <div className="profile-address-actions">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setShowAddressModal(true);
                          }}
                          className="profile-address-action-btn"
                          title="Edit address"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="profile-address-action-btn profile-address-action-btn--danger"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="profile-address-body">
                      <p className="profile-address-name">{address.name}</p>
                      <p className="profile-address-line">
                        {address.addressLine || address.addressLine1}
                        {(address.addressLine2) && `, ${address.addressLine2}`}
                      </p>
                      <p className="profile-address-city">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.phone && (
                        <p className="profile-address-phone">
                          <Phone className="w-3.5 h-3.5" />
                          {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add another address card */}
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="profile-add-address-card"
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Add another address</span>
                </button>
              </div>
            )}
          </div>

          {/* ──── RECENT ORDERS SECTION ──── */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <h2 className="profile-section-title">Recent Orders</h2>
              <button
                onClick={() => navigate(ROUTES.ORDERS)}
                className="profile-view-all-btn"
              >
                View All
              </button>
            </div>

            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 skeleton rounded-xl" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="profile-empty-orders">
                <div className="profile-empty-orders-icon">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="profile-empty-orders-title">No orders yet</h3>
                <p className="profile-empty-orders-text">
                  Start your spiritual journey with our curated collection of divine essentials.
                </p>
                <Button onClick={() => navigate(ROUTES.HOME)} className="mt-4">
                  Browse Shop
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="profile-order-card"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div className="profile-order-info">
                      <p className="profile-order-id">
                        Order #{order._id?.slice(-8)?.toUpperCase()}
                      </p>
                      <p className="profile-order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="profile-order-meta">
                      <Badge
                        variant={
                          order.status === 'delivered' ? 'success' :
                          order.status === 'cancelled' ? 'danger' :
                          order.status === 'shipped' ? 'info' : 'warning'
                        }
                        size="sm"
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </Badge>
                      <span className="profile-order-amount">
                        ₹{order.totalAmount || order.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ MODALS ═══════ */}

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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleEditProfile} className="space-y-5">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter your name"
          />
          <Input
            label="Phone Number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="Enter your phone number"
            maxLength={10}
          />
          <Input
            label="Email Address"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="Enter your email address"
          />
          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              loading={updateProfileMutation.isPending}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditProfileModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
