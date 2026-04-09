import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { addAddress, updateAddress } from '@/services/addressService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.string().optional(),
  addressLine: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
});

const AddressForm = ({ address = null, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      name: '',
      type: 'Home',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phone: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? updateAddress(address._id, data) : addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      toast.success(isEditing ? 'Address updated!' : 'Address added!');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save address');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="E.g. Jashneesh"
        />
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Address Type</label>
          <select 
            {...register('type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Address Line */}
      <Input
        label="Address Line"
        {...register('addressLine')}
        error={errors.addressLine?.message}
        placeholder="Street address, landmark, etc."
      />

      {/* City, State, Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          {...register('city')}
          error={errors.city?.message}
          placeholder="Mumbai"
        />
        <Input
          label="State"
          {...register('state')}
          error={errors.state?.message}
          placeholder="Maharashtra"
        />
        <Input
          label="Pincode"
          {...register('pincode')}
          error={errors.pincode?.message}
          placeholder="400001"
          maxLength={6}
        />
      </div>

      {/* Country & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Country"
          {...register('country')}
          error={errors.country?.message}
          placeholder="India"
        />
        <Input
          label="Phone Number"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="9876543210"
          maxLength={10}
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={mutation.isPending}
          className="flex-1"
        >
          {isEditing ? 'Update Address' : 'Add Address'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
