import {
	AppstoreOutlined,
	BarsOutlined,
	EnvironmentOutlined,
	StarFilled,
	HeartOutlined,
	CalendarOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Grid,
	Input,
	List,
	message,
	Modal,
	Radio,
	Row,
	Select,
	Space,
	Spin,
	Tag,
} from 'antd';
import moment from 'moment/moment';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropertyMap from '../../components/Map/PropertyMap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { createBooking, fetchParkingSpots } from '../../services/parkingService';
import { setCoordinates } from '../../redux/slice/coordinatesSlice';
import { PAKISTANI_CITIES } from '../../utils/constants';
import { BookOutlined } from '@ant-design/icons';
const { Search } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ParkingList = () => {
	const [spots, setSpots] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState({
		query: '',
		isAvailable: undefined,
		minPrice: '',
		maxPrice: '',
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});
	const [selectedSpot, setSelectedSpot] = useState(null);
	const [bookingModalVisible, setBookingModalVisible] = useState(false);
	const [bookingDate, setBookingDate] = useState(null);
	const [viewMode, setViewMode] = useState('split');
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [mapCenter, setMapCenter] = useState(null);
	const [locationInitialized, setLocationInitialized] = useState(false);
	const coordinates = useSelector((state) => state.coordinates); // Get coordinates from Redux
	const { isDarkMode } = useTheme();
	const screens = useBreakpoint();
	const isMobile = screens.xs;
	const dispatch = useDispatch();
	const [userLocation, setUserLocation] = useState(null);
	const [selectedCity, setSelectedCity] = useState(null);

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

	// Memoize the API call function to avoid infinite loops
	const loadParkingSpots = useCallback(async (debouncedFilters) => {
		try {
			setLoading(true);
			const response = await fetchParkingSpots(debouncedFilters);
			console.log('🚀 ~ loadParkingSpots ~ response:', response);
			setSpots(response.spots || []);
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadParkingSpots(filters);
	}, [filters, loadParkingSpots]);

	const handleSearch = (value) => {
		setFilters((prev) => ({ ...prev, query: value }));
	};

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleBookingSubmit = async () => {
		if (!isAuthenticated) {
			Modal.confirm({
				title: 'Login Required',
				content: 'You need to be logged in to book a parking spot. Would you like to login now?',
				okText: 'Login',
				cancelText: 'Cancel',
				onOk: () => navigate('/login'),
			});
			return;
		}

		try {
			await createBooking(selectedSpot._id, { date: bookingDate });
			message.success('Booking successful!');
			setBookingModalVisible(false);
			fetchParkingSpots(); // Refresh the list
		} catch (error) {
			message.error('Failed to create booking');
		}
	};

	const renderSpotCard = (spot) => (
		<Card
			hoverable
			style={{
				marginBottom: 24,
				width: '100%',
				maxWidth: 370,
				minWidth: 270,
				marginLeft: 'auto',
				marginRight: 'auto',
				borderRadius: 18,
				boxShadow: isDarkMode ? '0 2px 16px rgba(0,0,0,0.45)' : '0 2px 16px rgba(0,0,0,0.10)',
				padding: 0,
				overflow: 'hidden',
				position: 'relative',
				background: isDarkMode ? '#18191a' : '#fff',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
			bodyStyle={{ padding: 0 }}
		>
			{/* Status and Favorite */}
			<div style={{ position: 'absolute', top: 14, left: 14, zIndex: 2 }}>
				<Tag
					color={spot.isAvailable ? 'green' : 'red'}
					style={{ fontWeight: 600, borderRadius: 8, padding: '2px 12px' }}
				>
					{spot.isAvailable ? 'Available' : 'Unavailable'}
				</Tag>
			</div>
			<div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2 }}>
				<HeartOutlined style={{ fontSize: 22, color: '#aaa' }} />
			</div>
			{/* Image */}
			<div
				style={{ width: '100%', height: 160, overflow: 'hidden', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
			>
				<img
					src={spot.imageUrls[0] || '/default-parking.jpg'}
					alt={spot.name}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						display: 'block',
					}}
				/>
			</div>
			{/* Rating */}
			<div
				style={{
					position: 'absolute',
					top: 140,
					left: 18,
					background: '#fff',
					borderRadius: 16,
					padding: '2px 10px',
					boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
					display: 'flex',
					alignItems: 'center',
					fontWeight: 500,
				}}
			>
				<StarFilled style={{ color: '#faad14', marginRight: 4 }} />
				<span style={{ color: '#222' }}>{spot.rating || '4.8'}</span>
				<span style={{ color: '#888', marginLeft: 4, fontSize: 13 }}>({spot.ratingCount || 24})</span>
			</div>
			{/* Content */}
			<div style={{ padding: 18, paddingTop: 12 }}>
				<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{spot.name}</div>
				<div style={{ color: '#666', fontSize: 14, marginBottom: 8, minHeight: 36 }}>{spot.description}</div>
				<div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: 14, marginBottom: 4 }}>
					<EnvironmentOutlined style={{ marginRight: 6 }} />
					<span>
						{spot.address?.societyTown}, {spot.address?.city}
					</span>
					<span style={{ marginLeft: 8, fontSize: 13, color: '#aaa' }}>0.5 km away</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
					<span style={{ color: '#1677ff', fontWeight: 700, fontSize: 20, marginRight: 4 }}>₹ {spot.price}</span>
					<span style={{ color: '#888', fontSize: 14 }}>/day</span>
					<CalendarOutlined style={{ marginLeft: 'auto', color: '#aaa', fontSize: 16 }} />
					<span style={{ marginLeft: 4, color: '#888', fontSize: 13 }}>10 Jan</span>
				</div>
				<Button
					type="primary"
					block
					style={{
						borderRadius: 8,
						fontWeight: 600,
						fontSize: 16,
						marginTop: 8,
						height: 40,
					}}
					onClick={(e) => {
						e.stopPropagation();
						setSelectedSpot(spot);
						setBookingModalVisible(true);
					}}
				>
					<BookOutlined style={{ marginRight: 8 }} />
					Book Now
				</Button>
			</div>
		</Card>
	);

	// View mode selector component
	const renderViewModeSelector = () => {
		if (isMobile) {
			return (
				<Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} buttonStyle="solid">
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
			<Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} buttonStyle="solid">
				<Radio.Button value="split">
					<BarsOutlined /> List+Map
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

	// Main content rendering based on view mode
	const renderMainContent = () => {
		if (viewMode === 'map') {
			return (
				<div style={{ height: '100%' }}>
					<PropertyMap
						properties={spots.map((spot) => ({
							...spot,
							position: [spot.location.lat, spot.location.lng],
							popupContent: `${spot.name} - Rs.${spot.price}/day`,
						}))}
						center={mapCenter}
						zoom={12}
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
						margin: 0,
						width: '100%',
						background: isDarkMode ? '#141414' : '#f0f2f5',
					}}
				>
					<List
						grid={{
							gutter: 16,
							xs: 1,
							sm: 2,
							md: 3,
							lg: 3,
							xl: 4,
						}}
						dataSource={spots}
						renderItem={(spot) => (
							<List.Item style={{ display: 'flex', justifyContent: 'flex-start' }}>{renderSpotCard(spot)}</List.Item>
						)}
					/>
				</div>
			);
		}

		// Split view (default)
		return (
			<Row gutter={[16, 16]}>
				<Col span={8}>
					<div
						style={{
							height: 'calc(100vh - 200px)',
							overflowY: 'auto',
							overflowX: 'hidden',
							paddingRight: 8,
							background: isDarkMode ? '#141414' : '#f0f2f5',
						}}
					>
						<List
							dataSource={spots}
							renderItem={(spot) => (
								<List.Item style={{ display: 'flex', justifyContent: 'flex-start' }}>{renderSpotCard(spot)}</List.Item>
							)}
						/>
					</div>
				</Col>
				<Col span={16}>
					<div style={{ height: 'calc(100vh - 200px)' }}>
						<PropertyMap
							properties={spots.map((spot) => ({
								...spot,
								position: [spot.location.lat, spot.location.lng],
								popupContent: `${spot.name} - Rs.${spot.price}/day`,
							}))}
							center={mapCenter}
							zoom={12}
						/>
					</div>
				</Col>
			</Row>
		);
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: 'calc(100vh - 104px)',
				overflow: 'hidden',
			}}
		>
			{/* Top Bar */}
			<div
				style={{
					backgroundColor: isDarkMode ? '#1f1f1f' : 'white',
					padding: '10px',
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
				}}
			>
				<Row gutter={[16, 16]} align="middle" wrap={false}>
					<Col flex="440px">
						<Search
							placeholder="Search parking spots..."
							onChange={(e) => handleSearch(e.target.value)}
							style={{ width: '100%' }}
						/>
					</Col>
					<Col>{renderViewModeSelector()}</Col>
					<Col>
						<Select
							placeholder="Availability"
							style={{ width: '100%' }}
							onChange={(value) => handleFilterChange('isAvailable', value)}
							allowClear
						>
							<Option value="true">Available</Option>
							<Option value="false">Unavailable</Option>
						</Select>
					</Col>
					<Col>
						<Select
							placeholder="Sort By"
							style={{ width: '100%' }}
							onChange={(value) => handleFilterChange('sortBy', value)}
						>
							<Option value="price">Price</Option>
							<Option value="createdAt">Date</Option>
						</Select>
					</Col>
				</Row>
			</div>

			{/* Main Content */}
			<div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>{loading ? <Spin /> : renderMainContent()}</div>

			{/* Booking Modal */}
			<Modal
				title="Book Parking Spot"
				open={bookingModalVisible}
				onOk={handleBookingSubmit}
				onCancel={() => setBookingModalVisible(false)}
			>
				{selectedSpot && (
					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						<img
							src={selectedSpot.imageUrls[0] || '/default-parking.jpg'}
							alt={selectedSpot.name}
							style={{ width: '100%', height: '200px', objectFit: 'cover' }}
						/>
						<h2>{selectedSpot.name}</h2>
						<p>{selectedSpot.description}</p>
						<p>Price: Rs. {selectedSpot.price}/day</p>
						<DatePicker
							style={{ width: '100%' }}
							onChange={setBookingDate}
							disabledDate={(current) => current && current < moment().startOf('day')}
						/>
					</Space>
				)}
			</Modal>
		</div>
	);
};

export default ParkingList;
