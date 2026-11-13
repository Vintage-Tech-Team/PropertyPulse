import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, message, Modal, Spin } from 'antd';
import { fetchPropertyById } from '../../services/propertyService';
import PropertyMap from '../../components/Map/PropertyMap';
import { useAuth } from '../../contexts/AuthContext';
import AddPropertyReview from './AddPropertyReview';
import styles from './PropertyDetails.module.css';

const RATING_CATEGORIES = [
	{ key: 'cleanliness', label: 'Cleanliness' },
	{ key: 'communication', label: 'Communication' },
	{ key: 'location', label: 'Location' },
	{ key: 'valueForMoney', label: 'Value for money' },
	{ key: 'waterPlumbing', label: 'Water & plumbing' },
	{ key: 'electricityWiring', label: 'Electricity & wiring' },
	{ key: 'ventilation', label: 'Ventilation' },
];

const PinIcon = ({ className }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" strokeLinejoin="round" />
		<circle cx="12" cy="9.5" r="2.5" />
	</svg>
);

const StarIcon = ({ className }) => (
	<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
	</svg>
);

const ArrowLeftIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</svg>
);

const PenIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M4 20h4L19 9l-4-4L4 16v4Z" />
		<path d="m14 6 4 4" />
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

const Stars = ({ value }) => (
	<span className={styles.scoreStars} aria-label={`${value} out of 5`}>
		{[1, 2, 3, 4, 5].map((n) => (
			<StarIcon key={n} className={n <= Math.round(value) ? styles.starOn : styles.starOff} />
		))}
	</span>
);

const formatMonth = (date) => (date ? new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null);

const PropertyDetails = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const [property, setProperty] = useState(null);
	const [lightboxVisible, setLightboxVisible] = useState(false);
	const [currentImage, setCurrentImage] = useState(0);
	// currentImageList holds the array of image URLs currently shown in the lightbox
	const [currentImageList, setCurrentImageList] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load property details
	const loadPropertyDetails = useCallback(async () => {
		try {
			const data = await fetchPropertyById(id);
			setProperty(data);
		} catch (err) {
			message.error('Failed to fetch property details');
		}
	}, [id]);

	useEffect(() => {
		loadPropertyDetails();
	}, [loadPropertyDetails]);

	// Average of each rating category across reviews (unset categories are ignored)
	const categoryAverages = useMemo(() => {
		const reviews = property?.reviews || [];
		return RATING_CATEGORIES.map(({ key, label }) => {
			const values = reviews.map((r) => r.ratings?.[key]).filter((v) => v > 0);
			const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
			return { key, label, average };
		}).filter((c) => c.average !== null);
	}, [property]);

	if (!property) {
		return (
			<div className={styles.loading}>
				<Spin size="large" />
			</div>
		);
	}

	const images = property.imageUrls || [];
	const reviews = property.reviews || [];
	const rating = property.averageRating ? Number(property.averageRating) : null;
	const address = property.address || {};
	const area = [address.societyTown, address.city].filter(Boolean).join(', ');

	const handleImageClick = (index, list = null) => {
		// list: optional array to use for the lightbox (e.g., review.media)
		setCurrentImageList(list || images);
		setCurrentImage(index);
		setLightboxVisible(true);
	};

	const closeLightbox = () => {
		setLightboxVisible(false);
		setCurrentImageList(null);
	};

	const handleAddReviewClick = () => {
		if (!isAuthenticated) {
			Modal.confirm({
				title: 'Login Required',
				content: 'You need to be logged in to add a review. Would you like to login now?',
				okText: 'Login',
				cancelText: 'Cancel',
				onOk: () => {
					navigate('/login');
				},
			});
			return;
		}
		setIsModalOpen(true);
	};

	const galleryClass = [styles.gallery, images.length === 1 && styles.galleryOne, images.length === 2 && styles.galleryTwo]
		.filter(Boolean)
		.join(' ');

	const lightboxImages = currentImageList || images;

	const writeReviewButton = (
		<button type="button" className={styles.primaryButton} onClick={handleAddReviewClick}>
			<PenIcon />
			Write a review
		</button>
	);

	return (
		<div className={styles.page}>
			<button type="button" className={styles.backLink} onClick={() => navigate('/properties')}>
				<ArrowLeftIcon />
				Back to Discover
			</button>

			<div className={styles.header}>
				<div>
					{area && (
						<p className={styles.eyebrow}>
							<PinIcon />
							{area}
						</p>
					)}
					<h1 className={styles.title}>{property.name}</h1>
					<p className={styles.subtitle}>
						{rating ? (
							<span className={styles.ratingInline}>
								<StarIcon />
								{rating.toFixed(1)}
								<span>
									· {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
								</span>
							</span>
						) : (
							<span>No reviews yet</span>
						)}
						<span>Owned by {property.owner}</span>
					</p>
				</div>
				{writeReviewButton}
			</div>

			{/* Gallery: one large photo plus up to two smaller ones */}
			{images.length > 0 ? (
				<div className={galleryClass}>
					{images.slice(0, 3).map((url, index) => (
						<button
							key={url + index}
							type="button"
							className={`${styles.photo} ${index === 0 ? styles.photoMain : ''}`}
							onClick={() => handleImageClick(index)}
							aria-label={`View photo ${index + 1}`}
						>
							<img src={url} alt={`${property.name} ${index + 1}`} />
						</button>
					))}
					<button type="button" className={styles.allPhotos} onClick={() => handleImageClick(0)}>
						<GridIcon />
						View all {images.length} photos
					</button>
				</div>
			) : (
				<div className={styles.noPhotos}>No photos yet</div>
			)}

			<div className={styles.body}>
				<div className={styles.main}>
					<section className={styles.card}>
						<h2 className={styles.cardTitle}>About this place</h2>
						<p className={styles.description}>{property.description || 'No description provided.'}</p>
						<div className={styles.facts}>
							<div className={styles.fact}>
								<span className={styles.factLabel}>Area</span>
								<span className={styles.factValue}>{address.societyTown || '—'}</span>
							</div>
							<div className={styles.fact}>
								<span className={styles.factLabel}>City</span>
								<span className={styles.factValue}>{address.city || '—'}</span>
							</div>
							<div className={styles.fact}>
								<span className={styles.factLabel}>Owner</span>
								<span className={styles.factValue}>{property.owner}</span>
							</div>
							<div className={styles.fact}>
								<span className={styles.factLabel}>Listed</span>
								<span className={styles.factValue}>{formatMonth(property.createdAt) || '—'}</span>
							</div>
						</div>
					</section>

					{rating && categoryAverages.length > 0 && (
						<section className={styles.card}>
							<h2 className={styles.cardTitle}>Ratings breakdown</h2>
							<div className={styles.breakdown}>
								<div className={styles.scoreBig}>
									<span className={styles.scoreNumber}>{rating.toFixed(1)}</span>
									<Stars value={rating} />
									<span className={styles.muted}>
										{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
									</span>
								</div>
								<div className={styles.bars}>
									{categoryAverages.map(({ key, label, average }) => (
										<div key={key} className={styles.barRow}>
											<span className={styles.barLabel}>{label}</span>
											<span className={styles.barTrack}>
												<span className={styles.barFill} style={{ width: `${(average / 5) * 100}%`, display: 'block' }} />
											</span>
											<span className={styles.barValue}>{average.toFixed(1)}</span>
										</div>
									))}
								</div>
							</div>
						</section>
					)}

					<section className={styles.card}>
						<div className={styles.cardHeader}>
							<h2 className={styles.cardTitle}>Reviews</h2>
							<span className={styles.muted}>
								{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
							</span>
						</div>
						{reviews.length > 0 ? (
							<div className={styles.reviews}>
								{reviews.map((review) => {
									const name = review.reviewer?.name || 'Former tenant';
									const stay = [
										review.stayDuration && `Stayed ${review.stayDuration}`,
										formatMonth(review.moveOutDate) && `moved out ${formatMonth(review.moveOutDate)}`,
									]
										.filter(Boolean)
										.join(', ');
									return (
										<article key={review._id} className={styles.review}>
											<div className={styles.reviewHead}>
												<div className={styles.reviewer}>
													<span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span>
													<div>
														<p className={styles.reviewerName}>{name}</p>
														<p className={styles.reviewMeta}>{stay || `Reviewed ${formatMonth(review.createdAt)}`}</p>
													</div>
												</div>
												<Stars value={review.overallRating || 0} />
											</div>
											{review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
											<div className={styles.chips}>
												{RATING_CATEGORIES.filter(({ key }) => review.ratings?.[key] > 0).map(({ key, label }) => (
													<span key={key} className={styles.chip}>
														{label} <strong>{review.ratings[key]}</strong>
													</span>
												))}
											</div>
											{review.media?.length > 0 && (
												<div className={styles.media}>
													{review.media.map((url, index) => (
														<button key={url + index} type="button" onClick={() => handleImageClick(index, review.media)}>
															<img src={url} alt={`Shared by ${name} (${index + 1})`} />
														</button>
													))}
												</div>
											)}
										</article>
									);
								})}
							</div>
						) : (
							<p className={styles.empty}>No reviews yet. Lived here? Be the first to share your experience.</p>
						)}
					</section>
				</div>

				<aside className={styles.sidebar}>
					<section className={styles.card}>
						<h2 className={styles.cardTitle}>Location</h2>
						<div className={styles.mapBox}>
							<PropertyMap
								properties={[
									{
										_id: property._id,
										address: {
											location: {
												lng: address.location?.lng,
												lat: address.location?.lat,
											},
										},
									},
								]}
								center={[address.location?.lng, address.location?.lat]}
								zoom={15}
								propertyDetails={true}
								disableControls={true}
							/>
						</div>
						<p className={styles.address}>
							{[address.houseNumber && `House ${address.houseNumber}`, address.apartmentNumber && `Apt ${address.apartmentNumber}`, address.street, address.block]
								.filter(Boolean)
								.join(', ')}
							<br />
							{area}
							<br />
							<span className={styles.addressMuted}>{[address.state, address.country].filter(Boolean).join(', ')}</span>
						</p>
					</section>

					<section className={`${styles.card} ${styles.ctaCard}`}>
						<h2 className={styles.cardTitle}>Lived here?</h2>
						<p className={styles.ctaText}>Your review helps the next tenant know what to expect, from the plumbing to the landlord.</p>
						{writeReviewButton}
					</section>
				</aside>
			</div>

			{/* Lightbox Modal for Images */}
			<Modal
				open={lightboxVisible}
				onCancel={closeLightbox}
				footer={null}
				width="90%"
				centered
				styles={{
					body: {
						padding: 0,
					},
				}}
			>
				<div
					style={{
						position: 'relative',
						width: '100%',
						height: '80vh',
						backgroundColor: '#000',
					}}
				>
					<img
						src={lightboxImages[currentImage]}
						alt={`${currentImage + 1} of ${lightboxImages.length}`}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'contain',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							bottom: '20px',
							left: '0',
							right: '0',
							textAlign: 'center',
							color: '#fff',
							padding: '10px',
							backgroundColor: 'rgba(0,0,0,0.5)',
						}}
					>
						<Button
							type="text"
							style={{ color: '#fff', marginRight: '10px' }}
							onClick={() => setCurrentImage((currentImage - 1 + lightboxImages.length) % lightboxImages.length)}
						>
							Previous
						</Button>
						<span>{`${currentImage + 1} of ${lightboxImages.length}`}</span>
						<Button
							type="text"
							style={{ color: '#fff', marginLeft: '10px' }}
							onClick={() => setCurrentImage((currentImage + 1) % lightboxImages.length)}
						>
							Next
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				title="Add Review"
				open={isModalOpen}
				onCancel={() => !isSubmitting && setIsModalOpen(false)}
				footer={null}
				maskClosable={!isSubmitting}
				closable={!isSubmitting}
				width={640}
				style={{ top: 20 }}
				styles={{
					body: {
						height: 'calc(100vh - 180px)',
						overflow: 'auto',
						padding: '24px 24px 0',
					},
					// Background colors come from the app's Ant Design theme (light/dark)
					header: {
						position: 'sticky',
						top: 0,
						zIndex: 1,
						padding: '16px 24px',
						borderBottom: '1px solid rgba(127, 140, 145, 0.2)',
					},
					footer: {
						position: 'sticky',
						bottom: 0,
						zIndex: 1,
						padding: '16px 24px',
						borderTop: '1px solid rgba(127, 140, 145, 0.2)',
					},
					content: {
						padding: 0,
					},
					wrapper: {
						top: 20,
					},
				}}
			>
				<AddPropertyReview
					propertyId={id}
					onSuccess={() => {
						setIsModalOpen(false);
						loadPropertyDetails();
					}}
					onCancel={() => setIsModalOpen(false)}
					isSubmitting={isSubmitting}
					setIsSubmitting={setIsSubmitting}
				/>
			</Modal>
		</div>
	);
};

export default PropertyDetails;
