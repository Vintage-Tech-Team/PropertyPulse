import api from './api';

// Fetch all addresses with optional search query
export const fetchAddresses = async (params = {}) => {
	const query = new URLSearchParams(params).toString();
	const response = await api.get(`/addresses?${query}`);
	return response.data;
};

export const addAddress = async (addressData) => {
	const response = await api.post(`/addresses`, addressData);
	return response.data;
};

export const updateAddress = async (id, addressData) => {
	const response = await api.put(`/addresses/${id}`, addressData);
	return response.data;
};
