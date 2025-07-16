import axios from 'axios';
import { API_BASE_URL } from '../config';

export const fetchParkingSpots = async (filters = {}) => {
	try {
		const response = await axios.get(`${API_BASE_URL}/api/parkings`, { params: filters });
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

export const createParkingSpot = async (parkingData) => {
	try {
		const formData = new FormData();
		Object.keys(parkingData).forEach((key) => {
			if (key === 'images') {
				parkingData[key].forEach((image) => formData.append('images', image));
			} else {
				formData.append(key, parkingData[key]);
			}
		});

		const response = await axios.post(`${API_BASE_URL}/api/parkings`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

export const updateParkingSpot = async (id, parkingData) => {
	try {
		const response = await axios.put(`${API_BASE_URL}/api/parkings/${id}`, parkingData);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

export const deleteParkingSpot = async (id) => {
	try {
		const response = await axios.delete(`${API_BASE_URL}/api/parkings/${id}`);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};
