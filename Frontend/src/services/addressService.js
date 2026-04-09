import api from './api';

// Get user's addresses
export const getAddresses = async () => {
    const { data } = await api.get('/api/address/get');
    return data;
};

// Add new address
export const addAddress = async (addressData) => {
    const { data } = await api.post('/api/address/create', addressData);
    return data;
};

// Update address  (_id must be included in addressData)
export const updateAddress = async (addressId, addressData) => {
    const { data } = await api.put('/api/address/update', { _id: addressId, ...addressData });
    return data;
};

// Delete / disable address (_id sent in request body)
export const deleteAddress = async (addressId) => {
    const { data } = await api.delete('/api/address/disable', { data: { _id: addressId } });
    return data;
};
