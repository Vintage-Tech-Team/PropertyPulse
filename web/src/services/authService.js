import api from './api';

// User login
export const login = async (credentials) => {
	const response = await api.post('/auth/login', credentials);
	return response.data;
};

// User registration
export const register = async (userData) => {
	const response = await api.post('/auth/register', userData);
	return response.data;
};

// Verify user's email
export const verifyEmail = async (token) => {
	const response = await api.get(`/auth/verify/${token}`);
	return response.data;
};

// Fetch user profile
export const getUserProfile = async () => {
	const response = await api.get('/users/profile'); // Calls the backend API
	return response.data; // Returns the user profile data
};

// Request password reset (send email)
export const requestPasswordReset = async (email) => {
	const response = await api.post('/auth/forgot-password', { email });
	return response.data;
};

// Reset password using token
export const resetPassword = async (token, newPassword) => {
	const response = await api.post(`/auth/reset-password/${token}`, { password: newPassword });
	return response.data;
};
