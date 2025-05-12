import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Add request interceptor for authentication
axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Fetch all properties
// export const fetchProperties = async () => {
//   const response = await axios.get(`${API_BASE_URL}/properties`);
//   return response.data;
// };

// Fetch properties with optional search parameters
export const fetchProperties = async (params = {}) => {
	const query = new URLSearchParams(params).toString();
	const response = await axios.get(`${API_BASE_URL}/properties?${query}`);
	return response.data;
};

// Fetch property by ID
export const fetchPropertyById = async (id) => {
	const response = await axios.get(`${API_BASE_URL}/properties/${id}`, {
		params: { isAdmin: true },
	});
	return response.data;
};

// Add a property
export const addProperty = async (propertyData) => {
	const response = await axios.post(`${API_BASE_URL}/properties`, propertyData);
	return response.data;
};

// Update property by ID
export const updateProperty = async (id, updates) => {
	const response = await axios.put(`${API_BASE_URL}/properties/${id}`, updates);
	return response.data;
};

// Delete a property
export const deleteProperty = async (propertyId) => {
	const response = await axios.delete(`${API_BASE_URL}/properties/${propertyId}`);
	return response.data;
};
