import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { AimOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { setCoordinates } from '../../redux/slice/coordinatesSlice';
import { useDispatch } from 'react-redux';
import { Button, message } from 'antd';

// Add these utility functions at the top level
const isValidLatLng = (lat, lng) => {
	return typeof lat === 'number' && typeof lng === 'number' && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const createMarkerPosition = (lat, lng) => {
	if (!isValidLatLng(Number(lat), Number(lng))) return null;
	return { lat: Number(lat), lng: Number(lng) };
};

// Add custom marker SVGs
const markerIcons = {
	property: `<div style="cursor: pointer; transform: scale(1.2);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path d="M12 3L4 9v12h16V9l-8-6z" fill="#d32f2f" stroke="white"/>
            <path d="M9 14h6v7H9z" fill="white"/>
            <path d="M12 5l-6 4.5V11h12v-1.5L12 5z" fill="white"/>
        </svg>
    </div>`,
	currentLocation: `<div style="transform: scale(1.2);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path d="M12 3L4 9v12h16V9l-8-6z" fill="#1890ff" stroke="white"/>
            <path d="M9 14h6v7H9z" fill="white"/>
            <path d="M12 5l-6 4.5V11h12v-1.5L12 5z" fill="white"/>
        </svg>
    </div>`,
	draggable: `<div style="cursor: move; transform: scale(1.2);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path d="M12 3L4 9v12h16V9l-8-6z" fill="#00c853" stroke="white"/>
            <path d="M9 14h6v7H9z" fill="white"/>
            <path d="M12 5l-6 4.5V11h12v-1.5L12 5z" fill="white"/>
        </svg>
    </div>`,
};

// Update libraries array to remove 'marker'
const libraries = ['places', 'geocoding'];

const PropertyMap = ({
	properties,
	center,
	zoom,
	mapContainerStyle,
	propertyDetails = false,
	onLocationSelect = null,
	draggableMarker = false,
	selectedLocation = null,
	onMoveEnd = null,
	disableControls = false, // Add this prop
	onPlaceSelect = null, // Add this prop
}) => {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries,
		mapIds: [process.env.REACT_APP_GOOGLE_MAPS_API_KEY], // Add your Map ID here
	});

	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Default center and zoom values
	const defaultCenter = { lat: 33.6844, lng: 73.0479 }; // Default to Islamabad
	const defaultZoom = zoom || 10;

	const [mapCenter, setMapCenter] = useState(center ? { lat: center[1], lng: center[0] } : defaultCenter);
	const [mapZoom, setMapZoom] = useState(defaultZoom);
	const [userLocation, setUserLocation] = useState(null);
	const [markerPosition, setMarkerPosition] = useState(() => {
		if (!selectedLocation) return null;
		return createMarkerPosition(selectedLocation[1], selectedLocation[0]);
	});
	const [mapInstance, setMapInstance] = useState(null);
	const [markers, setMarkers] = useState(new Map());

	const createAdvancedMarker = useCallback(
		async (position, options = {}) => {
			if (!isLoaded || !window.google) return null;

			const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

			const markerElement = document.createElement('div');
			markerElement.dataset.markerType = options.isProperty
				? 'property'
				: options.isDraggable
				? 'draggable'
				: 'currentLocation';

			// Select appropriate icon based on marker type
			if (options.isProperty) {
				markerElement.innerHTML = markerIcons.property;
			} else if (options.draggable) {
				markerElement.innerHTML = markerIcons.draggable;
			} else {
				markerElement.innerHTML = markerIcons.currentLocation;
			}

			const markerOptions = {
				map: options.map,
				position,
				content: markerElement,
				title: options.title,
			};

			if (options.draggable) {
				markerOptions.draggable = true;
			}

			return new AdvancedMarkerElement(markerOptions);
		},
		[isLoaded],
	);

	// Replace StandaloneSearchBox with Autocomplete
	const [autocomplete, setAutocomplete] = useState(null);

	const onLoadAutocomplete = (autocomplete) => {
		setAutocomplete(autocomplete);
	};

	const onPlaceChanged = () => {
		if (autocomplete) {
			const place = autocomplete.getPlace();
			if (place.geometry) {
				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();
				const location = createMarkerPosition(lat, lng);

				if (location) {
					setMapCenter(location);
					setMapZoom(15);

					if (draggableMarker) {
						setMarkerPosition(location);
						if (onLocationSelect) {
							onLocationSelect([lng, lat]);
						}
					}

					if (onPlaceSelect) {
						const addressComponents = place.address_components;
						const city = addressComponents?.find(
							(component) =>
								component.types.includes('locality') || component.types.includes('administrative_area_level_2'),
						)?.long_name;

						onPlaceSelect({
							coordinates: [lng, lat],
							city: city || '',
							fullAddress: place.formatted_address,
						});
					}
				}
			}
		}
	};

	// Handle reverse geocoding when marker is moved
	const handleMarkerPositionChange = async (position) => {
		if (!isLoaded) return;

		const geocoder = new window.google.maps.Geocoder();
		try {
			const response = await geocoder.geocode({ location: position });
			if (response.results[0]) {
				const addressComponents = response.results[0].address_components;
				const city = addressComponents?.find(
					(component) =>
						component.types.includes('locality') || component.types.includes('administrative_area_level_2'),
				)?.long_name;

				if (onPlaceSelect) {
					onPlaceSelect({
						coordinates: [position.lng, position.lat],
						city: city || '',
						fullAddress: response.results[0].formatted_address,
					});
				}
			}
		} catch (error) {
			console.error('Geocoding error:', error);
		}
	};

	// Default map container style
	const defaultContainerStyle = {
		width: '100%',
		height: '100%',
	};

	// Update view when center changes
	useEffect(() => {
		if (center) {
			setMapCenter({ lat: center[1], lng: center[0] });
			setMapZoom(zoom || 12);
		}
	}, [center, zoom]);

	// Fetch user's current location
	useEffect(() => {
		// Skip geolocation if center is already provided (e.g., city is selected)
		if (center) {
			return;
		}

		if (navigator.geolocation) {
			const locationSuccess = (position) => {
				const location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				setUserLocation(location);

				// Only set view and marker if no marker exists and we're in selection mode
				if (!markerPosition && draggableMarker) {
					setMarkerPosition({
						longitude: location.lng,
						latitude: location.lat,
					});
					if (onLocationSelect) {
						onLocationSelect([location.lng, location.lat]);
					}
					setMapCenter({
						lat: location.lat,
						lng: location.lng,
					});
					setMapZoom(13);
				}
			};

			const locationError = (error) => {
				console.error('Error fetching location:', error);
				// We'll just log the error but not show it to user
				// The app will fall back to default city
			};

			navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
		}
	}, [dispatch, draggableMarker, onLocationSelect, center, markerPosition]);

	// Handle propertyDetails logic
	useEffect(() => {
		if (propertyDetails && properties?.length > 0) {
			const firstProperty = properties[0];
			if (firstProperty?.address?.location) {
				setMapCenter({
					lat: firstProperty.address.location.lat,
					lng: firstProperty.address.location.lng,
				});
				setMapZoom(15);
			}
		}
	}, [propertyDetails, properties]);

	const handleMapClick = (event) => {
		if (draggableMarker) {
			const newPosition = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng(),
			};
			setMarkerPosition(newPosition);
			if (onLocationSelect) {
				onLocationSelect([newPosition.lng, newPosition.lat]);
			}
		}
	};

	const onMapLoad = (map) => {
		setMapInstance(map);
	};

	const handleMapIdle = () => {
		if (!mapInstance) return;

		const center = mapInstance.getCenter();
		dispatch(
			setCoordinates({
				latitude: center.lat(),
				longitude: center.lng(),
			}),
		);

		if (onMoveEnd) {
			onMoveEnd({
				latitude: center.lat(),
				longitude: center.lng(),
				zoom: mapInstance.getZoom(),
			});
		}
	};

	// Handle "Go to Current Location" button click
	const handleGoToCurrentLocation = () => {
		if (userLocation) {
			setMapCenter({
				lat: userLocation.lat,
				lng: userLocation.lng,
			});
			setMapZoom(13);
			if (draggableMarker) {
				setMarkerPosition({
					lat: userLocation.lat,
					lng: userLocation.lng,
				});
				if (onLocationSelect) {
					onLocationSelect([userLocation.lng, userLocation.lat]);
				}
			}
			dispatch(
				setCoordinates({
					latitude: userLocation.lat,
					longitude: userLocation.lng,
				}),
			);
		} else {
			// Try to get location again
			if (navigator.geolocation) {
				message.info('Trying to get your location...');
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const location = {
							lat: position.coords.latitude,
							lng: position.coords.longitude,
						};
						setUserLocation(location);
						setMapCenter({
							lat: location.lat,
							lng: location.lng,
						});
						setMapZoom(13);
						if (draggableMarker) {
							setMarkerPosition({
								lat: location.lat,
								lng: location.lng,
							});
							if (onLocationSelect) {
								onLocationSelect([location.lng, location.lat]);
							}
						}
						dispatch(
							setCoordinates({
								latitude: location.lat,
								longitude: location.lng,
							}),
						);
					},
					(error) => {
						console.error('Error fetching location:', error);
						message.error('Could not get your current location. Please select a city or click on the map.');
					},
				);
			} else {
				message.error('Could not get your current location. Please select a city or click on the map.');
			}
		}
	};

	// Update marker management
	useEffect(() => {
		if (!isLoaded || !mapInstance) return;

		const setupMarkers = async () => {
			// Clear existing markers
			markers.forEach((marker) => (marker.map = null));
			markers.clear();

			// Add property markers
			for (const property of properties || []) {
				const position = createMarkerPosition(property.address?.location?.lat, property.address?.location?.lng);
				if (!position) continue;

				const marker = await createAdvancedMarker(position, {
					isProperty: true,
					title: property.name,
				});

				if (marker) {
					marker.map = mapInstance;
					marker.addListener('click', () => navigate(`/properties/${property._id}`));
					markers.set(property._id, marker);
				}
			}

			// Add user location marker
			if (userLocation && !draggableMarker) {
				const marker = await createAdvancedMarker(userLocation, {
					isProperty: false,
				});
				if (marker) {
					marker.map = mapInstance;
					markers.set('userLocation', marker);
				}
			}

			// Add draggable marker
			if (draggableMarker && markerPosition) {
				const marker = await createAdvancedMarker(markerPosition, {
					isProperty: false,
					draggable: true,
				});
				if (marker) {
					marker.map = mapInstance;
					marker.addListener('dragend', (e) => {
						const position = marker.position;
						const newPosition = {
							lat: position.lat,
							lng: position.lng,
						};
						setMarkerPosition(newPosition);
						handleMarkerPositionChange(newPosition);
						if (onLocationSelect) {
							onLocationSelect([newPosition.lng, newPosition.lat]);
						}
					});
					markers.set('draggable', marker);
				}
			}
		};

		setupMarkers();

		return () => {
			markers.forEach((marker) => (marker.map = null));
			markers.clear();
		};
	}, [isLoaded, mapInstance, properties, userLocation, markerPosition, draggableMarker, createAdvancedMarker]);

	if (loadError) {
		return <div>Error loading maps</div>;
	}

	if (!isLoaded) {
		return <div>Loading maps...</div>;
	}

	// Update GoogleMap component options
	return (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			{isLoaded && (
				<>
					{!disableControls && (
						<div
							style={{
								position: 'absolute',
								top: '10px',
								left: '10px',
								zIndex: 10,
								width: '240px',
							}}
						>
							<Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
								<input
									type="text"
									placeholder="Search locations..."
									style={{
										width: '100%',
										height: '40px',
										padding: '0 12px',
										borderRadius: '4px',
										border: '1px solid #d9d9d9',
										boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
									}}
								/>
							</Autocomplete>
						</div>
					)}

					<GoogleMap
						mapContainerStyle={mapContainerStyle || defaultContainerStyle}
						center={mapCenter}
						zoom={mapZoom}
						onClick={handleMapClick}
						onLoad={onMapLoad}
						onIdle={handleMapIdle}
						options={{
							streetViewControl: false,
							mapTypeControl: false,
							fullscreenControl: false,
							zoomControl: true,
							scrollwheel: true,
							mapId: 'YOUR_MAP_ID_HERE', // Add your Map ID here
						}}
					>
						{/* Markers are now managed through the markers Map */}
					</GoogleMap>
				</>
			)}

			{!disableControls && (
				<Button
					type="primary"
					icon={<AimOutlined />}
					onClick={handleGoToCurrentLocation}
					style={{
						position: 'absolute',
						bottom: '20px',
						left: '20px',
						zIndex: 10,
					}}
				>
					Current Location
				</Button>
			)}
		</div>
	);
};

export default PropertyMap;
