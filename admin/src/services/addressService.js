import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Fetch all addresses with optional search query
export const fetchAddresses = async (params = {}) => {
	const { page, limit, query } = params;
	const queryParams = new URLSearchParams();

	if (page) queryParams.append('page', page);
	if (limit) queryParams.append('limit', limit);
	if (query) queryParams.append('query', query);

	const queryString = queryParams.toString();
	const response = await axios.get(`${API_BASE_URL}/addresses${queryString ? `?${queryString}` : ''}`);
	return response.data;
};

export const addAddress = async (addressData) => {
	const response = await axios.post(`${API_BASE_URL}/addresses`, addressData);
	return response.data;
};

export const deleteAddress = async (id) => {
	const response = await axios.delete(`${API_BASE_URL}/addresses/${id}`);
	return response.data;
};
