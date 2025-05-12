import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
	apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
	version: 'weekly',
	libraries: ['places'],
});

export const initializeGoogleMaps = async () => {
	try {
		const google = await loader.load();
		return google;
	} catch (error) {
		console.error('Error loading Google Maps:', error);
		throw error;
	}
};

export const getPlacePredictions = async (input) => {
	const google = await loader.load();
	const service = new google.maps.places.AutocompleteService();

	try {
		const response = await service.getPlacePredictions({
			input,
			componentRestrictions: { country: 'PK' },
			types: ['address'],
		});
		return response.predictions;
	} catch (error) {
		console.error('Error getting place predictions:', error);
		throw error;
	}
};

export const getPlaceDetails = async (placeId) => {
	const google = await loader.load();
	const service = new google.maps.places.PlacesService(document.createElement('div'));

	return new Promise((resolve, reject) => {
		service.getDetails({ placeId, fields: ['formatted_address', 'geometry', 'name'] }, (result, status) => {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				resolve(result);
			} else {
				reject(new Error(`Place details request failed: ${status}`));
			}
		});
	});
};
