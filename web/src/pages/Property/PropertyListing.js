import { useState, useEffect, useCallback } from 'react';
import { List, Card, message, Button, Col, Row, Input, Rate, Grid, Select, Radio, Slider, Modal } from 'antd';
import { AppstoreOutlined, BarsOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchProperties } from '../../services/propertyService';
import PropertyMap from '../../components/Map/PropertyMap';
import { debounce } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { setCoordinates } from '../../redux/slice/coordinatesSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { PAKISTANI_CITIES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const { Search } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const PropertyListing = () => {
	const { isAuthenticated } = useAuth();
	const page = 1;
	const [properties, setProperties] = useState([]);
	const [limit] = useState(10); // Results per page
	const [loading, setLoading] = useState(false);
	const [selectedCity, setSelectedCity] = useState(null);
	const [mapCenter, setMapCenter] = useState(null);
	const [locationInitialized, setLocationInitialized] = useState(false);
	const [userLocation, setUserLocation] = useState(null);
	const [viewMode, setViewMode] = useState('split'); // 'split', 'grid', or 'map'
	const { isDarkMode } = useTheme();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const coordinates = useSelector((state) => state.coordinates); // Get coordinates from Redux
	const screens = useBreakpoint();
	const isMobile = screens.xs;
	const [radius, setRadius] = useState(10); // Add this near other state declarations

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

	// Modify the view mode radio group for mobile
	const renderViewModeSelector = () => {
		if (isMobile) {
			return (
				<Radio.Group
					value={viewMode}
					onChange={(e) => setViewMode(e.target.value)}
					buttonStyle="solid"
					style={{ width: '100%' }}
				>
					<Radio.Button value="grid">
						<AppstoreOutlined /> List
					</Radio.Button>
					<Radio.Button value="map">
						<EnvironmentOutlined /> Map
					</Radio.Button>
				</Radio.Group>
			);
		}
		return (
			<Radio.Group
				value={viewMode}
				onChange={(e) => setViewMode(e.target.value)}
				buttonStyle="solid"
				style={{ width: '100%' }}
			>
				<Radio.Button value="split">
					<BarsOutlined /> List & Map
				</Radio.Button>
				<Radio.Button value="grid">
					<AppstoreOutlined /> Grid
				</Radio.Button>
				<Radio.Button value="map">
					<EnvironmentOutlined /> Map
				</Radio.Button>
			</Radio.Group>
		);
	};

	// Update the main content rendering
	const renderMainContent = () => {
		if (viewMode === 'map') {
			return (
				<div style={{ height: '100%' }}>
					<PropertyMap
						properties={properties}
						center={mapCenter}
						zoom={mapCenter ? 12 : undefined}
						onMoveEnd={handleMapMoveEnd}
					/>
				</div>
			);
		}

		if (viewMode === 'grid') {
			return (
				<div
					style={{
						height: '100%',
						overflowY: 'auto',
						overflowX: 'hidden',
						paddingBottom: '20px',
						margin: '0',
						width: '100%',
						msOverflowStyle: 'none' /* Hide scrollbar for IE and Edge */,
						scrollbarWidth: 'none' /* Hide scrollbar for Firefox */,
						WebkitOverflowScrolling: 'touch' /* Smooth scrolling for iOS */,
					}}
				>
					<style>
						{`
							/* Hide scrollbar for Chrome, Safari and Opera */
							div::-webkit-scrollbar {
								display: none;
							}
						`}
					</style>
					<List
						loading={loading}
						dataSource={properties}
						style={{ padding: '0 1px' }} // Prevent content touching edges
						grid={{
							gutter: 16,
							xs: 1,
							sm: isMobile ? 1 : 2,
							md: isMobile ? 1 : 3,
							lg: isMobile ? 1 : 4,
							xl: isMobile ? 1 : 4,
						}}
						renderItem={(property) => (
							<List.Item>
								<Card
									hoverable
									onClick={() => handleCardClick(property._id)}
									style={{ ...cardStyle, marginBottom: '10px' }}
									styles={{
										body: {
											padding: '12px',
										},
									}}
								>
									{!isMobile ? (
										// Desktop Grid View
										<div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
											<div>
												<img
													src={property.imageUrls?.[0] || 'placeholder.jpg'}
													alt={property.name}
													style={{
														width: '100%',
														height: '200px',
														objectFit: 'cover',
														borderRadius: '4px',
													}}
												/>
												<h4 style={{ marginTop: '8px', color: isDarkMode ? '#fff' : '#000' }}>{property.name}</h4>
												<p>{property.address?.city}</p>
												<Rate disabled allowHalf value={property?.averageRating || 0} />
											</div>

											{/* Footer - align View button to end on desktop, full-width on mobile */}
											<div style={{ marginTop: 8, display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
												<Button
													size="small"
													type="primary"
													block={isMobile}
													onClick={(e) => {
														e.stopPropagation();
														handleCardClick(property._id);
													}}
												>
													Reviews
												</Button>
											</div>
										</div>
									) : (
										// Mobile List View
										<Row gutter={[16, 16]} align="middle">
											<Col span={8}>
												<img
													src={property.imageUrls?.[0] || 'placeholder.jpg'}
													alt={property.name}
													style={{
														width: '100%',
														height: '80px',
														objectFit: 'cover',
														borderRadius: '4px',
													}}
												/>
											</Col>
											<Col span={16}>
												<h4 style={{ margin: '0 0 4px 0', color: isDarkMode ? '#fff' : '#000' }}>{property.name}</h4>
												<p style={{ margin: '0 0 4px 0' }}>{property.address?.city}</p>
												<Rate disabled allowHalf value={property?.averageRating || 0} />
												{/* View button on mobile list card */}
												<div style={{ marginTop: 8 }}>
													<Button
														size="small"
														type="primary"
														onClick={(e) => {
															e.stopPropagation();
															handleCardClick(property._id);
														}}
													>
														Reviews
													</Button>
												</div>
											</Col>
										</Row>
									)}
								</Card>
							</List.Item>
						)}
					/>
				</div>
			);
		}

		// Split view - only shown on desktop
		if (!isMobile) {
			return (
				<div style={{ display: 'flex', height: '100%', gap: '10px' }}>
					{/* List Section */}
					<div
						style={{
							flex: 1,
							overflowY: 'auto',
							paddingRight: '10px',
						}}
					>
						<List
							loading={loading}
							dataSource={properties}
							renderItem={(property) => (
								<Card
									hoverable
									onClick={() => handleCardClick(property._id)}
									style={{ ...cardStyle, marginBottom: '10px' }}
								>
									<Row gutter={[16, 16]} align="middle">
										<Col xs={24} sm={6}>
											{property.imageUrls && property.imageUrls[0] ? (
												<img
													src={property.imageUrls[0]}
													alt={property.name}
													style={{
														width: '100%',
														height: '120px',
														objectFit: 'cover',
														borderRadius: '4px',
													}}
												/>
											) : (
												<div
													style={{
														width: '100%',
														height: '120px',
														background: '#f5f5f5',
														borderRadius: '4px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													No Image
												</div>
											)}
										</Col>
										<Col xs={24} sm={18}>
											{/* Use a column flex container so the button can be aligned to the end responsively */}
											<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
												<div>
													<h3 style={{ margin: '0 0 8px 0' }}>{property.name}</h3>
													<p style={{ margin: '0 0 8px 0', lineHeight: '1.6', fontSize: '14px' }}>
														<strong>House No.:</strong> {property.address?.houseNumber || 'N/A'},<br />
														<strong>Street:</strong> {property.address?.street || 'N/A'},<br />
														<strong>Block:</strong> {property.address?.block || 'N/A'},<br />
														<strong>Society/Town:</strong> {property.address?.societyTown || 'N/A'},<br />
														<strong>City:</strong> {property.address?.city || 'N/A'}
													</p>

													<p style={{ margin: '0 0 8px 0' }}>Owner: {property.owner}</p>
													<Rate disabled allowHalf value={property?.averageRating || 0} />
												</div>

												{/* Footer - aligns button to end; becomes full-width on mobile */}
												<div style={{ marginTop: 8, display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
													<Button
														size="small"
														type="primary"
														block={isMobile}
														onClick={(e) => {
															e.stopPropagation();
															handleCardClick(property._id);
														}}
													>
														Reviews
													</Button>
												</div>
											</div>
										</Col>
									</Row>
								</Card>
							)}
						/>
					</div>

					{/* Map Section */}
					<div style={{ flex: 1, height: '100%' }}>
						<PropertyMap
							properties={properties}
							center={mapCenter}
							zoom={mapCenter ? 12 : undefined}
							onMoveEnd={handleMapMoveEnd}
						/>
					</div>
				</div>
			);
		}

		// Fallback to grid view on mobile if split view is selected
		return viewMode === 'split' ? setViewMode('grid') : null;
	};

	const cardStyle = {
		backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
		color: isDarkMode ? '#ffffff' : '#000000',
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
		<div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 104px)', overflow: 'hidden' }}>
			{/* Top Bar */}
			<div
				style={{
					backgroundColor: isDarkMode ? '#1f1f1f' : 'white',
					padding: '10px',
					boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
					zIndex: 10,
				}}
			>
				<Row gutter={[16, 16]} align="middle" wrap={true}>
					{/* Add Property Button */}
					<Col xs={24} sm={6} md={4} lg={3}>
						<Button type="primary" onClick={handleAddPropertyClick} style={{ width: '100%' }}>
							Add Property
						</Button>
					</Col>

					{/* Search Input */}
					<Col xs={24} sm={8} md={6} lg={5}>
						<Search
							placeholder="Search by name or address"
							onChange={(e) => handleSearchDebounced(e.target.value)}
							style={{ width: '100%' }}
						/>
					</Col>

					{/* City Select */}
					<Col xs={24} sm={8} md={4} lg={4}>
						<Select
							placeholder="Select city"
							style={{ width: '100%' }}
							onChange={handleCityChange}
							allowClear
							value={selectedCity}
						>
							{Object.values(PAKISTANI_CITIES).map((city) => (
								<Option key={city.name} value={city.name}>
									{city.name}
								</Option>
							))}
						</Select>
					</Col>

					{/* Radius Slider */}
					<Col xs={24} sm={12} md={6} lg={6}>
						<div style={{ padding: '0 10px' }}>
							<span style={{ marginBottom: '8px', display: 'block', color: isDarkMode ? '#fff' : '#000' }}>
								Radius: {radius} km
							</span>
							<Slider
								min={1}
								max={50}
								value={radius}
								onChange={setRadius}
								tooltip={{ formatter: (value) => `${value} km` }}
							/>
						</div>
					</Col>

					{/* View Mode Selector */}
					<Col xs={24} sm={12} md={4} lg={6}>
						{renderViewModeSelector()}
					</Col>
				</Row>
			</div>

			{/* Main Content */}
			<div
				style={{
					flex: 1,
					overflow: 'hidden',
					padding: '10px',
					backgroundColor: isDarkMode ? '#141414' : '#f0f2f5',
					// Remove any height constraints that might prevent scrolling
					position: 'relative',
				}}
			>
				{renderMainContent()}
			</div>
		</div>
	);
};

export default PropertyListing;
