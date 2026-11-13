import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { message, Grid, Modal, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchProperties } from '../../services/propertyService';
import PropertyMap from '../../components/Map/PropertyMap';
import { debounce } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { setCoordinates } from '../../redux/slice/coordinatesSlice';
import { PAKISTANI_CITIES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import styles from './PropertyListing.module.css';

const { useBreakpoint } = Grid;

const RADIUS_OPTIONS = [5, 10, 25, 50];

const SORTERS = {
	recommended: null, // API order
	rating: (a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0),
	newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
	name: (a, b) => a.name.localeCompare(b.name),
};

const PinIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" strokeLinejoin="round" />
		<circle cx="12" cy="9.5" r="2.5" />
	</svg>
);

const SearchIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" />
	</svg>
);

const PlusIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
		<path d="M12 5v14M5 12h14" />
	</svg>
);

const CheckIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</svg>
);

const StarIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
	</svg>
);

const SparkleIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M12 2.5 13.8 9 20 11l-6.2 2L12 19.5 10.2 13 4 11l6.2-2L12 2.5Z" />
	</svg>
);

const ListMapIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
		<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
	</svg>
);

const GridIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<rect x="4" y="4" width="7" height="7" rx="1.5" />
		<rect x="13" y="4" width="7" height="7" rx="1.5" />
		<rect x="4" y="13" width="7" height="7" rx="1.5" />
		<rect x="13" y="13" width="7" height="7" rx="1.5" />
	</svg>
);

const formatLocation = (address = {}) =>
	[address.societyTown, address.block, address.city].filter(Boolean).join(', ') || 'Location not set';

const PropertyCard = ({ property, onOpen }) => {
	const rating = property.averageRating ? Number(property.averageRating) : null;
	const [imageFailed, setImageFailed] = useState(false);
	const imageUrl = !imageFailed && property.imageUrls?.[0];

	return (
		<button type="button" className={styles.card} onClick={() => onOpen(property._id)}>
			<div className={styles.media}>
				{imageUrl ? (
					<img src={imageUrl} alt={property.name} loading="lazy" onError={() => setImageFailed(true)} />
				) : (
					<div className={styles.noPhoto}>No photo yet</div>
				)}
				{rating >= 4.5 && (
					<span className={styles.badge}>
						<SparkleIcon />
						Top rated
					</span>
				)}
			</div>
			<div className={styles.cardBody}>
				<div className={styles.cardTop}>
					<h3 className={styles.cardTitle}>{property.name}</h3>
					{rating ? (
						<span className={styles.rating}>
							<StarIcon />
							{rating.toFixed(1)}
						</span>
					) : (
						<span className={styles.noRating}>No reviews yet</span>
					)}
				</div>
				<p className={styles.location}>
					<PinIcon />
					{formatLocation(property.address)}
				</p>
				<div className={styles.cardMeta}>
					<span>Owner: {property.owner}</span>
					<span className={styles.reviewsLink}>Read reviews →</span>
				</div>
			</div>
		</button>
	);
};

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
	const [sortBy, setSortBy] = useState('recommended');
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const coordinates = useSelector((state) => state.coordinates); // Get coordinates from Redux
	const screens = useBreakpoint();
	const isMobile = !screens.md;
	const [radius, setRadius] = useState(10);
	const searchRef = useRef(null);

	// No split view on small screens; show the list instead
	const effectiveView = isMobile && viewMode === 'split' ? 'grid' : viewMode;

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
				apiParams.radius = radius;
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
		[page, limit, coordinates, selectedCity, radius],
	);

	// Center on a [lng, lat] pair and make it the search origin
	const centerOn = useCallback(
		(lngLat) => {
			setMapCenter(lngLat);
			dispatch(setCoordinates({ latitude: lngLat[1], longitude: lngLat[0] }));
		},
		[dispatch],
	);

	// Try to get user's current location on component mount, falling back to Lahore
	useEffect(() => {
		if (locationInitialized) return;

		const fallBackToLahore = () => {
			const lahoreCoords = PAKISTANI_CITIES.Lahore.coordinates;
			setSelectedCity('Lahore');
			centerOn(lahoreCoords);
			setUserLocation({ lat: lahoreCoords[1], lng: lahoreCoords[0] });
			setLocationInitialized(true);
		};

		if (!navigator.geolocation) {
			fallBackToLahore();
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude: lat, longitude: lng } = position.coords;
				centerOn([lng, lat]);
				setUserLocation({ lat, lng });
				setLocationInitialized(true);
			},
			(error) => {
				console.error('Error getting location:', error);
				fallBackToLahore();
			},
		);
	}, [centerOn, locationInitialized]);

	// Load properties when coordinates or selectedCity changes
	useEffect(() => {
		// Only load properties once we've initialized the location
		if (locationInitialized) {
			loadProperties();
		}
	}, [loadProperties, coordinates, selectedCity, locationInitialized]);

	// Debounce search input
	const handleSearchDebounced = useMemo(() => debounce((query) => loadProperties({ query }), 500), [loadProperties]);

	useEffect(() => () => handleSearchDebounced.cancel(), [handleSearchDebounced]);

	// ⌘K / Ctrl+K focuses the search box
	useEffect(() => {
		const onKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				searchRef.current?.focus();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	const handleCardClick = (propertyId) => {
		navigate(`/properties/${propertyId}`);
	};

	// Handle city chip selection; null means "near me"
	const handleCityChange = (cityName) => {
		setSelectedCity(cityName);
		if (cityName) {
			centerOn(PAKISTANI_CITIES[cityName].coordinates);
		} else if (userLocation) {
			centerOn([userLocation.lng, userLocation.lat]);
		}
	};

	// Handle map move end to fetch properties at current map center
	const handleMapMoveEnd = (viewState) => {
		dispatch(
			setCoordinates({
				latitude: viewState.latitude,
				longitude: viewState.longitude,
			}),
		);

		// The map also reports a move after recentering on a city chip, so only clear the
		// city once the map has actually been moved away from it (~1 km)
		if (selectedCity) {
			const [lng, lat] = PAKISTANI_CITIES[selectedCity].coordinates;
			if (Math.abs(viewState.latitude - lat) > 0.01 || Math.abs(viewState.longitude - lng) > 0.01) {
				setSelectedCity(null);
			}
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

	const sortedProperties = useMemo(() => {
		const sorter = SORTERS[sortBy];
		return sorter ? [...properties].sort(sorter) : properties;
	}, [properties, sortBy]);

	const placeLabel = selectedCity ? `${selectedCity}, Pakistan` : 'Near you';
	const countLabel = `${properties.length} ${properties.length === 1 ? 'place' : 'places'} ${
		selectedCity ? `in ${selectedCity}` : `within ${radius} km`
	}`;

	const viewOptions = isMobile
		? [
				{ value: 'grid', label: 'List', icon: <ListMapIcon /> },
				{ value: 'map', label: 'Map', icon: <PinIcon /> },
		  ]
		: [
				{ value: 'split', label: 'List & map', icon: <ListMapIcon /> },
				{ value: 'grid', label: 'Grid', icon: <GridIcon /> },
				{ value: 'map', label: 'Map', icon: <PinIcon /> },
		  ];

	const renderViewToggle = (className = '') => (
		<div className={`${styles.viewToggle} ${className}`} role="group" aria-label="View">
			{viewOptions.map(({ value, label, icon }) => (
				<button
					key={value}
					type="button"
					className={`${styles.viewOption} ${effectiveView === value ? styles.viewOptionActive : ''}`}
					onClick={() => setViewMode(value)}
					aria-pressed={effectiveView === value}
				>
					{icon}
					{label}
				</button>
			))}
		</div>
	);

	const panelClass = {
		split: styles.panel,
		grid: `${styles.panel} ${styles.panelGrid}`,
		map: `${styles.panel} ${styles.panelMap}`,
	}[effectiveView];

	return (
		<div className={styles.page}>
			<div className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>
						<PinIcon />
						{placeLabel}
					</p>
					<h1 className={styles.title}>Find a place to call yours.</h1>
					<p className={styles.subtitle}>Honest reviews from the people who lived there. Your next chapter.</p>
				</div>
				<button type="button" className={styles.addButton} onClick={handleAddPropertyClick}>
					<PlusIcon />
					Add a property
				</button>
			</div>

			<div className={panelClass}>
				<section className={styles.listColumn}>
					<div className={styles.filters}>
						<div className={styles.search}>
							<SearchIcon />
							<input
								ref={searchRef}
								className={styles.searchInput}
								placeholder="Search by name, area or address"
								onChange={(e) => handleSearchDebounced(e.target.value)}
								aria-label="Search properties"
							/>
							{!isMobile && <span className={styles.kbd}>⌘ K</span>}
						</div>

						<div className={styles.chips}>
							<button
								type="button"
								className={`${styles.chip} ${!selectedCity ? styles.chipActive : ''}`}
								onClick={() => handleCityChange(null)}
							>
								{!selectedCity && <CheckIcon />}
								Near me
							</button>
							{Object.values(PAKISTANI_CITIES).map((city) => (
								<button
									key={city.name}
									type="button"
									className={`${styles.chip} ${selectedCity === city.name ? styles.chipActive : ''}`}
									onClick={() => handleCityChange(city.name)}
								>
									{selectedCity === city.name && <CheckIcon />}
									{city.name}
								</button>
							))}
						</div>

						<div className={styles.selectRow}>
							<select
								className={styles.select}
								value={radius}
								onChange={(e) => setRadius(Number(e.target.value))}
								aria-label="Search radius"
							>
								{RADIUS_OPTIONS.map((km) => (
									<option key={km} value={km}>
										Within {km} km
									</option>
								))}
							</select>
						</div>
					</div>

					<div className={styles.listHeader}>
						<div>
							<h2 className={styles.listTitle}>Places you might love</h2>
							<p className={styles.listCount}>{loading ? 'Loading…' : countLabel}</p>
						</div>
						<div className={styles.listHeaderActions}>
							<select
								className={`${styles.select} ${styles.sortSelect}`}
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								aria-label="Sort by"
							>
								<option value="recommended">Recommended</option>
								<option value="rating">Top rated</option>
								<option value="newest">Newest</option>
								<option value="name">Name A–Z</option>
							</select>
							{effectiveView !== 'split' && renderViewToggle()}
						</div>
					</div>

					<div className={styles.list}>
						{loading && properties.length === 0 ? (
							<div className={styles.empty}>
								<Spin />
							</div>
						) : sortedProperties.length === 0 ? (
							<div className={styles.empty}>No places found here yet. Try another city or a wider radius.</div>
						) : (
							sortedProperties.map((property) => (
								<PropertyCard key={property._id} property={property} onOpen={handleCardClick} />
							))
						)}
					</div>
				</section>

				<section className={styles.mapColumn}>
					{effectiveView !== 'grid' && renderViewToggle(styles.mapToggle)}
					<PropertyMap
						properties={properties}
						center={mapCenter}
						zoom={mapCenter ? 12 : undefined}
						onMoveEnd={handleMapMoveEnd}
					/>
				</section>
			</div>
		</div>
	);
};

export default PropertyListing;
