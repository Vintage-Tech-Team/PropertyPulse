import api from './api';

const API_BASE_URL = '/contacts';

// Send a contact message
export const sendContactMessage = async (data) => {
	const response = await api.post(`${API_BASE_URL}`, data);
	return response.data;
};

// Get all contact messages (admin)
export const getAllContactMessages = async () => {
	const response = await api.get(`${API_BASE_URL}`);
	return response.data;
};

// Delete a contact message by ID (admin)
export const deleteContactMessage = async (id) => {
	const response = await api.delete(`${API_BASE_URL}/${id}`);
	return response.data;
};

// Update a contact message by ID (e.g., mark as answered)
export const updateContactMessage = async (id, data) => {
	const response = await api.patch(`${API_BASE_URL}/${id}`, data);
	return response.data;
};
