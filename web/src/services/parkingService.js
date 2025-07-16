import api from './api';

export const fetchParkingSpots = async (params = {}) => {
	const query = new URLSearchParams(params).toString();
	const response = await api.get(`/parkings?${query}`);
	return response.data;
};

export const getParkingSpotById = async (id) => {
	const response = await api.get(`/parkings/${id}`);
	return response.data;
};

export const createParkingSpot = async (parkingData) => {
	try {
		const formData = new FormData();

		// Add basic fields
		Object.keys(parkingData).forEach((key) => {
			if (key !== 'images') {
				formData.append(key, parkingData[key]);
			}
		});

		// Handle parking spot images
		if (parkingData.images) {
			parkingData.images.forEach((image) => {
				formData.append('images', image);
			});
		}

		const response = await api.post('/parkings', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		console.error('Failed to create parking spot:', error);
		throw error;
	}
};

export const updateParkingSpot = async (id, parkingData) => {
	try {
		const formData = new FormData();

		// Handle existing images
		if (parkingData.existingImages) {
			formData.append('imageUrls', JSON.stringify(parkingData.existingImages));
		}

		// Handle new images
		if (parkingData.newImages) {
			parkingData.newImages.forEach((image) => {
				formData.append('images', image);
			});
		}

		// Add other fields
		Object.keys(parkingData).forEach((key) => {
			if (!['images', 'existingImages', 'newImages'].includes(key)) {
				formData.append(key, parkingData[key]);
			}
		});

		const response = await api.put(`/parkings/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		console.error('Failed to update parking spot:', error);
		throw error;
	}
};

export const deleteParkingSpot = async (id) => {
	const response = await api.delete(`/parkings/${id}`);
	return response.data;
};

export const createBooking = async (parkingId, bookingData) => {
	try {
		const response = await api.post(`/parkings/${parkingId}/book`, bookingData);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};
