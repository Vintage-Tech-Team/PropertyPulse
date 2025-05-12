import api from './api';

export const addReview = async (reviewData) => {
	try {
		const formData = new FormData();

		// Add basic fields
		formData.append('property', reviewData.get('property'));
		formData.append('reviewer', reviewData.get('reviewer'));
		formData.append('ratings', reviewData.get('ratings'));
		formData.append('overallRating', reviewData.get('overallRating'));
		formData.append('comment', reviewData.get('comment'));
		formData.append('stayDuration', reviewData.get('stayDuration'));
		formData.append('moveInDate', reviewData.get('moveInDate'));
		formData.append('moveOutDate', reviewData.get('moveOutDate'));
		formData.append('consumerId', reviewData.get('consumerId'));

		// Add remaining images after electricity bill
		const reviewImages = reviewData.getAll('images');
		reviewImages.forEach((image) => {
			formData.append('files', image);
		});

		const response = await api.post('/reviews', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		if (error.response?.data?.error === 'Consumer ID does not match with property records') {
			throw new Error('Consumer ID verification failed');
		}
		console.error('Failed to add review:', error.message);
		throw error;
	}
};
