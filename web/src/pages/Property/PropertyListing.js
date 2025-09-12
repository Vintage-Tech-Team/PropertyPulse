import { useState, useEffect, useCallback } from 'react';
import { message, Input,  Select, Slider, Modal, Spin } from 'antd';
import { 
  SearchOutlined, 
  HeartOutlined, 
  HeartFilled, 
  EnvironmentOutlined, 
  AppstoreOutlined, 
  UnorderedListOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchProperties } from '../../services/propertyService';
import PropertyMap from '../../components/Map/PropertyMap';
import { debounce } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { setCoordinates } from '../../redux/slice/coordinatesSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { PAKISTANI_CITIES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import styles from './PropertyListing.module.css';

const { Search } = Input;
const { Option } = Select;

const PropertyListing = () => {
	const { isAuthenticated } = useAuth();
	const page = 1;
	const [properties, setProperties] = useState([]);
	const [limit] = useState(12); // Results per page - increased for better grid
	const [loading, setLoading] = useState(false);
	const [selectedCity, setSelectedCity] = useState(null);
	const [mapCenter, setMapCenter] = useState(null);
	const [locationInitialized, setLocationInitialized] = useState(false);
	const [userLocation, setUserLocation] = useState(null);
	const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'map'
	const [favorites, setFavorites] = useState(new Set());
	const { isDarkMode } = useTheme();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const coordinates = useSelector((state) => state.coordinates);
	const [radius, setRadius] = useState(10);
	const [isMobile, setIsMobile] = useState(false);

	// Check for mobile on mount and resize
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Define the callback for loading properties
	const loadProperties = useCallback(
		async (searchParams = {}) => {
			setLoading(true);

			// Base parameters
			let apiParams = {
				page,
				limit,
				...(selectedCity ? { city: selectedCity } : {}),
			};

			// If there's a search query, only use the query parameter
			if (searchParams.query) {
				apiParams.query = searchParams.query;
			}
			// Otherwise, use coordinates if they're valid
			else if (coordinates.latitude !== null && coordinates.longitude !== null) {
				apiParams.latitude = coordinates.latitude;
				apiParams.longitude = coordinates.longitude;
				apiParams.radius = radius; // Add radius parameter
			}

			try {
				const data = await fetchProperties(apiParams);
				setProperties(data.properties);
			} catch (err) {
				console.error('Failed to fetch properties:', err);
				message.error('Failed to fetch properties');
			} finally {
				setLoading(false);
			}
		},
		[page, limit, coordinates, selectedCity, radius], // Add radius to dependencies
	);

	// Try to get user's current location on component mount
	useEffect(() => {
		if (!locationInitialized) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						// User's location obtained successfully
						const lat = position.coords.latitude;
						const lng = position.coords.longitude;

						// Set coordinates in Redux store
						dispatch(
							setCoordinates({
								latitude: lat,
								longitude: lng,
							}),
						);

						// Set map center to user's location
						setMapCenter([lng, lat]);
						setLocationInitialized(true);
						setUserLocation({ lat, lng });
					},
					(error) => {
						console.error('Error getting location:', error);
						// Fall back to Lahore as default city
						const lahoreCoords = PAKISTANI_CITIES.Lahore.coordinates;
						setSelectedCity('Lahore');
						setMapCenter(lahoreCoords);

						// Update Redux store with Lahore coordinates
						dispatch(
							setCoordinates({
								latitude: lahoreCoords[1],
								longitude: lahoreCoords[0],
							}),
						);

						setLocationInitialized(true);
						setUserLocation({
							lat: lahoreCoords[1],
							lng: lahoreCoords[0],
						});
					},
				);
			} else {
				// Geolocation not supported, use Lahore as default
				const lahoreCoords = PAKISTANI_CITIES.Lahore.coordinates;
				setSelectedCity('Lahore');
				setMapCenter(lahoreCoords);

				// Update Redux store with Lahore coordinates
				dispatch(
					setCoordinates({
						latitude: lahoreCoords[1],
						longitude: lahoreCoords[0],
					}),
				);

				setLocationInitialized(true);
				setUserLocation({
					lat: lahoreCoords[1],
					lng: lahoreCoords[0],
				});
			}
		}
	}, [dispatch, locationInitialized]);

	// Load properties when coordinates or selectedCity changes
	useEffect(() => {
		// Only load properties once we've initialized the location
		if (locationInitialized) {
			// Always load properties - we need to ensure API call happens on city selection
			loadProperties();
		}
	}, [loadProperties, coordinates, selectedCity, locationInitialized]);

	// Debounce search input
	const handleSearchDebounced = debounce((query) => {
		
		loadProperties({ query });
	}, 500);

	// Toggle favorite
	const toggleFavorite = (propertyId, e) => {
		e.stopPropagation();
		const newFavorites = new Set(favorites);
		if (newFavorites.has(propertyId)) {
			newFavorites.delete(propertyId);
		} else {
			newFavorites.add(propertyId);
		}
		setFavorites(newFavorites);
	};

	const handleCardClick = (propertyId) => {
		navigate(`/properties/${propertyId}`); // Navigate to property details page
	};

	// Handle city selection
	const handleCityChange = (cityName) => {
		setSelectedCity(cityName);
		if (cityName) {
			const cityData = PAKISTANI_CITIES[cityName];
			setMapCenter(cityData.coordinates);

			// Update Redux store with selected city coordinates
			// This will trigger property fetching
			dispatch(
				setCoordinates({
					latitude: cityData.coordinates[1],
					longitude: cityData.coordinates[0],
				}),
			);
		} else {
			// If city selection is cleared and we have user location, use that
			if (userLocation) {
				setMapCenter([userLocation.lng, userLocation.lat]);
				dispatch(
					setCoordinates({
						latitude: userLocation.lat,
						longitude: userLocation.lng,
					}),
				);
			} else {
				setMapCenter(null);
			}
		}
	};

	// Handle map move end to fetch properties at current map center
	const handleMapMoveEnd = (viewState) => {
		// Always update coordinates when map moves
		dispatch(
			setCoordinates({
				latitude: viewState.latitude,
				longitude: viewState.longitude,
			}),
		);

		// Only clear selected city when map is manually moved
		// This ensures next move will trigger API call with the right parameters
		if (selectedCity) {
			console.log('Clearing selected city because map was moved manually');
			setSelectedCity(null);
		}
	};

	// Property Card Component
	const PropertyCard = ({ property }) => (
		<div 
			className={`${styles.propertyCard} ${isDarkMode ? styles.dark : ''}`}
			onClick={() => handleCardClick(property._id)}
		>
			<div className={styles.imageContainer}>
				<img
					src={property.imageUrls?.[0] || '/placeholder.svg'}
					alt={property.name}
					className={styles.propertyImage}
				/>
				<button
					className={`${styles.favoriteButton} ${favorites.has(property._id) ? styles.active : ''}`}
					onClick={(e) => toggleFavorite(property._id, e)}
				>
					{favorites.has(property._id) ? <HeartFilled /> : <HeartOutlined />}
				</button>
			</div>
			<div className={styles.cardContent}>
				<div className={styles.propertyLocation}>
					<EnvironmentOutlined />
					<span>{property.address?.city}</span>
				</div>
				<h3 className={`${styles.propertyName} ${isDarkMode ? styles.dark : ''}`}>
					{property.name}
				</h3>
				<div className={`${styles.propertyDetails} ${isDarkMode ? styles.dark : ''}`}>
					{property.address?.societyTown && `${property.address.societyTown}, `}
					{property.address?.block && `Block ${property.address.block}`}
				</div>
				{property.averageRating > 0 && (
					<div className={styles.ratingContainer}>
						<div className={`${styles.rating} ${isDarkMode ? styles.dark : ''}`}>
							<span className={styles.ratingStars}>★</span>
							{/* <span>{property?.averageRating?.toFixed(1) || '0.0'}</span> */}
						</div>
					</div>
				)}
				<div className={`${styles.propertyPrice} ${isDarkMode ? styles.dark : ''}`}>
					Owner: {property.owner}
				</div>
			</div>
		</div>
	);

	// Property List Item Component
	const PropertyListItem = ({ property }) => (
		<div 
			className={`${styles.propertyListItem} ${isDarkMode ? styles.dark : ''}`}
			onClick={() => handleCardClick(property._id)}
		>
			<div className={styles.listImageContainer}>
				<img
					src={property.imageUrls?.[0] || '/placeholder.svg'}
					alt={property.name}
					className={styles.listPropertyImage}
				/>
			</div>
			<div className={styles.listCardContent}>
				<div>
					<div className={styles.propertyLocation}>
						<EnvironmentOutlined />
						<span>{property.address?.city}</span>
					</div>
					<h3 className={`${styles.propertyName} ${isDarkMode ? styles.dark : ''}`}>
						{property.name}
					</h3>
					<div className={`${styles.propertyDetails} ${isDarkMode ? styles.dark : ''}`}>
						<strong>Address:</strong> {property.address?.houseNumber && `${property.address.houseNumber}, `}
						{property.address?.street && `${property.address.street}, `}
						{property.address?.block && `Block ${property.address.block}, `}
						{property.address?.societyTown}
					</div>
				</div>
				<div>
					{property.averageRating > 0 && (
						<div className={styles.ratingContainer}>
							<div className={`${styles.rating} ${isDarkMode ? styles.dark : ''}`}>
								<span className={styles.ratingStars}>★</span>
								{/* <span>{property?.averageRating?.toFixed(1) || '0.0'}</span> */}
							</div>
						</div>
					)}
					<div className={`${styles.propertyPrice} ${isDarkMode ? styles.dark : ''}`}>
						Owner: {property.owner}
					</div>
				</div>
			</div>
			<button
				className={`${styles.favoriteButton} ${favorites.has(property._id) ? styles.active : ''}`}
				onClick={(e) => toggleFavorite(property._id, e)}
				style={{ position: 'absolute', top: '16px', right: '16px' }}
			>
				{favorites.has(property._id) ? <HeartFilled /> : <HeartOutlined />}
			</button>
		</div>
	);

	// Main content rendering
	const renderMainContent = () => {
		if (loading) {
			return (
				<div className={`${styles.loadingContainer} ${isDarkMode ? styles.dark : ''}`}>
					<Spin size="large" />
				</div>
			);
		}

		if (properties.length === 0) {
			return (
				<div className={`${styles.emptyState} ${isDarkMode ? styles.dark : ''}`}>
					<h2 className={`${styles.emptyStateTitle} ${isDarkMode ? styles.dark : ''}`}>
						No properties found
					</h2>
					<p className={styles.emptyStateDescription}>
						Try adjusting your search criteria or explore different areas.
					</p>
				</div>
			);
		}

		if (viewMode === 'map') {
			return (
				<div className={styles.mapSection}>
					<PropertyMap
						properties={properties}
						center={mapCenter}
						zoom={mapCenter ? 12 : undefined}
						onMoveEnd={handleMapMoveEnd}
					/>
				</div>
			);
		}

		if (viewMode === 'list') {
			return (
				<div className={`${styles.propertiesSection} ${isDarkMode ? styles.dark : ''}`}>
					<div className={styles.propertiesList}>
						{properties.map((property) => (
							<PropertyListItem key={property._id} property={property} />
						))}
					</div>
				</div>
			);
		}

		// Grid view (default) - shows both properties and map
		if (isMobile) {
			// On mobile, show only grid
			return (
				<div className={`${styles.propertiesSection} ${isDarkMode ? styles.dark : ''}`}>
					<div className={styles.propertiesGrid}>
						{properties.map((property) => (
							<PropertyCard key={property._id} property={property} />
						))}
					</div>
				</div>
			);
		} else {
			// On desktop, show split view with grid and map
			return (
				<div className={styles.splitView}>
					<div className={`${styles.propertiesSection} ${isDarkMode ? styles.dark : ''}`}>
						<div className={styles.propertiesGrid}>
							{properties.map((property) => (
								<PropertyCard key={property._id} property={property} />
							))}
						</div>
					</div>
					
						<PropertyMap
							properties={properties}
							center={mapCenter}
							zoom={mapCenter ? 12 : undefined}
							onMoveEnd={handleMapMoveEnd}
						/>
					
				</div>
			);
		}
	};

	const handleAddPropertyClick = () => {
		if (!isAuthenticated) {
			Modal.confirm({
				title: 'Login Required',
				content: 'You need to be logged in to add a property. Would you like to login now?',
				okText: 'Login',
				cancelText: 'Cancel',
				onOk: () => {
					navigate('/login');
				},
			});
			return;
		}
		navigate('/add-property');
	};

	return (
		<div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
			{/* Modern Search Bar */}
			<div className={`${styles.searchBar} ${isDarkMode ? styles.dark : ''}`}>
				<div className={styles.searchForm}>
					{/* Add Property Button */}
					<button className={styles.addPropertyBtn} onClick={handleAddPropertyClick}>
						Add Property
					</button>

					{/* Search Input */}
					<div className={styles.searchInput}>
						<Search
							placeholder="Search destinations"
							prefix={<SearchOutlined />}
							onChange={(e) => handleSearchDebounced(e.target.value)}
							size="large"
						/>
					</div>

					{/* Filter Buttons */}
					<div className={styles.filterButtons}>
						{/* City Filter */}
						<Select
							placeholder="Anywhere"
							style={{ minWidth: 120 }}
							onChange={handleCityChange}
							allowClear
							value={selectedCity}
							size="large"
						>
							{Object.values(PAKISTANI_CITIES).map((city) => (
								<Option key={city.name} value={city.name}>
									{city.name}
								</Option>
							))}
						</Select>

						{/* Radius Filter */}
						<div className={`${styles.filterButton} ${isDarkMode ? styles.dark : ''}`}>
							<GlobalOutlined />
							<span>{radius} km</span>
							<Slider
								min={1}
								max={50}
								value={radius}
								onChange={setRadius}
								style={{ width: 80, margin: 0 }}
								tooltip={{ formatter: (value) => `${value} km` }}
							/>
						</div>

						{/* View Toggle */}
						<div className={`${styles.viewToggle} ${isDarkMode ? styles.dark : ''}`}>
							<button
								className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.active : ''} ${isDarkMode ? styles.dark : ''}`}
								onClick={() => setViewMode('grid')}
							>
								<AppstoreOutlined />
							</button>
							<button
								className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.active : ''} ${isDarkMode ? styles.dark : ''}`}
								onClick={() => setViewMode('list')}
							>
								<UnorderedListOutlined />
							</button>
							<button
								className={`${styles.viewToggleBtn} ${viewMode === 'map' ? styles.active : ''} ${isDarkMode ? styles.dark : ''}`}
								onClick={() => setViewMode('map')}
							>
								<EnvironmentOutlined />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className={styles.mainContent}>
				{renderMainContent()}
			</div>
		</div>
	);
};

export default PropertyListing;
