import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Fetch all reviews
export const fetchReviews = async (params = {}) => {
	const { page, limit, query, status, sortBy, sortOrder } = params;
	const queryParams = new URLSearchParams();

	if (page) queryParams.append('page', page);
	if (limit) queryParams.append('limit', limit);
	if (query) queryParams.append('query', query);
	if (status) queryParams.append('status', status);
	if (sortBy) queryParams.append('sortBy', sortBy);
	if (sortOrder) queryParams.append('sortOrder', sortOrder);

	const queryString = queryParams.toString();
	const response = await axios.get(`${API_BASE_URL}/reviews${queryString ? `?${queryString}` : ''}`);
	return response.data;
};

export const addReview = async (reviewData) => {
	const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
	return response.data;
};

export const approveReview = async (reviewId) => {
	try {
		const response = await axios.patch(`${API_BASE_URL}/reviews/${reviewId}/approve`);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to approve review');
	}
};

export const flagReview = async (reviewId) => {
	try {
		const response = await axios.patch(`${API_BASE_URL}/reviews/${reviewId}/flag`);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to flag review');
	}
};

// Delete a review
export const deleteReview = async (reviewId) => {
	const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
	return response.data;
};
