import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchUsers = async (params = {}) => {
	const { page, limit, query, verified, sortBy, sortOrder } = params;
	const queryParams = new URLSearchParams();

	if (page) queryParams.append('page', page);
	if (limit) queryParams.append('limit', limit);
	if (query) queryParams.append('query', query);
	if (verified !== undefined) queryParams.append('verified', verified);
	if (sortBy) queryParams.append('sortBy', sortBy);
	if (sortOrder) queryParams.append('sortOrder', sortOrder);

	const queryString = queryParams.toString();
	const response = await axios.get(`${API_BASE_URL}/users${queryString ? `?${queryString}` : ''}`);
	return response.data;
};

// Add a user
export const addUser = async (userData) => {
	const response = await axios.post(`${API_BASE_URL}/users`, userData);
	return response.data;
};

// Update user by ID
export const updateUser = async (id, updates) => {
	const response = await axios.put(`${API_BASE_URL}/users/${id}`, updates);
	return response.data;
};

// Delete a user
export const deleteUser = async (userId) => {
	const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
	return response.data;
};
