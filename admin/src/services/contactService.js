import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Get all contact messages
export const getAllContactMessages = async () => {
	return axios.get(`${API_BASE_URL}/contacts`);
};

// Delete a contact message by ID
export const deleteContactMessage = async (id) => {
	return axios.delete(`${API_BASE_URL}/contacts/${id}`);
};

// Update a contact message by ID
export const updateContactMessage = async (id, data) => {
	return axios.put(`${API_BASE_URL}/contacts/${id}`, data);
};
