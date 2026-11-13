import api from './api';

// Fetch all properties
export const fetchProperties = async (params = {}) => {
	const query = new URLSearchParams(params).toString();
	const response = await api.get(`/properties?${query}`);
	return response.data;
};

// Fetch property by ID
export const fetchPropertyById = async (id, isProfile = false) => {
	const response = await api.get(`/properties/${id}`, {
		params: { isProfile },
	});
	return response.data;
};

// Add a property with proper API interaction
export const addProperty = async (propertyData) => {
	try {
		const formData = new FormData();

		// Add basic fields
		formData.append('name', propertyData.get('name'));
		formData.append('description', propertyData.get('description'));
		formData.append('owner', propertyData.get('owner'));
		formData.append('address', propertyData.get('address'));
		formData.append('createdBy', propertyData.get('createdBy'));
		formData.append('consumerId', propertyData.get('consumerId'));

		// Handle property images first
		const propertyImages = propertyData.getAll('images');
		propertyImages.forEach((image) => {
			formData.append('files', image);
		});

		// Append electricity bill as the last image
		const electricityBill = propertyData.get('electricityBill');
		if (electricityBill) {
			formData.append('electricityBill', electricityBill); // Add as last image
		}

		const response = await api.post('/properties', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		if (error.response?.data?.error === 'A property with this Consumer ID already exists') {
			const duplicateError = new Error('Consumer ID already exists');
			duplicateError.existingPropertyId = error.response.data.existingPropertyId;
			throw duplicateError;
		}
		console.error('Failed to add property:', error.message);
		throw error;
	}
};

// Update property
export const updateProperty = async (id, { name, description, owner, fileList, consumerId, electricityBill }) => {
	try {
		const formData = new FormData();

		// Add basic fields
		formData.append('name', name);
		formData.append('description', description);
		formData.append('owner', owner);
		formData.append('consumerId', consumerId);

		// Handle regular property images
		const regularImages = fileList.filter((file) => !file.type || file.type !== 'electricityBill');

		// Handle existing images with URLs
		const existingImages = regularImages.filter((file) => file.url).map((file) => file.url);

		// Append existing image URLs as JSON string
		if (existingImages.length > 0) {
			formData.append('imageUrls', JSON.stringify(existingImages));
		}

		// Handle new regular images - append to 'files' field
		regularImages
			.filter((file) => file.originFileObj)
			.forEach((file) => {
				formData.append('files', file.originFileObj);
			});

		// Handle electricity bill
		if (electricityBill instanceof File) {
			// If it's a new file
			formData.append('electricityBill', electricityBill);
		} else if (typeof electricityBill === 'string' && electricityBill.trim() !== '') {
			// If it's an existing URL
			formData.append('electricityBillImage', electricityBill);
		}

		console.log('FormData contents:');
		for (let [key, value] of formData.entries()) {
			console.log(`${key}:`, value instanceof File ? value.name : value);
		}

		const response = await api.put(`/properties/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		console.error('Failed to update property:', error.message);
		throw error;
	}
};
