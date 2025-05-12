import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, List, message, Modal, Row, Rate } from 'antd';
import { fetchPropertyById } from '../../services/propertyService';
import PropertyMap from '../../components/Map/PropertyMap'; // Import PropertyMap component
import { getUserIdFromToken } from '../../utils/token';
import { useAuth } from '../../contexts/AuthContext';
import AddPropertyReview from './AddPropertyReview';

const PropertyDetails = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const [property, setProperty] = useState(null);
	const [lightboxVisible, setLightboxVisible] = useState(false);
	const [currentImage, setCurrentImage] = useState(0);
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

	if (!property) return <div>Loading...</div>;

	const handleImageClick = (index) => {
		setCurrentImage(index);
		setLightboxVisible(true);
	};

	const closeLightbox = () => setLightboxVisible(false);

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

	return (
		<div style={{ padding: '20px' }}>
			{/* Action Buttons */}
			<Row gutter={[16, 16]} align="middle" style={{ marginBottom: '20px' }}>
				<Col>
					<Button type="primary" onClick={() => navigate('/properties')}>
						Back
					</Button>
				</Col>
				<Col>
					<Button type="primary" onClick={handleAddReviewClick}>
						Add Review
					</Button>
				</Col>
			</Row>

			{/* Top Section: Details and Map */}
			<Row gutter={[24, 24]}>
				{/* Property Details Card */}
				<Col xs={24} lg={12}>
					<Card title={property.name} style={{ height: '100%' }}>
						<p>
							<strong>Owner:</strong> {property.owner}
						</p>
						<p>
							<strong>Description:</strong> {property.description}
						</p>
						<div>
							<strong>Address:</strong>
							<div style={{ marginLeft: '20px', marginTop: '8px' }}>
								<p style={{ margin: '4px 0' }}>
									{property.address?.houseNumber}
									{property.address?.block && `, Block ${property.address?.block}`}
									{property.address?.street && `, Street ${property.address?.street}`}
								</p>
								<p style={{ margin: '4px 0' }}>
									{property.address?.societyTown}
									{property.address?.city && `, ${property.address?.city}`}
								</p>
								<p style={{ margin: '4px 0', color: '#666' }}>
									{property.address?.state}, {property.address?.country}
								</p>
							</div>
						</div>
						<p style={{ marginTop: '16px' }}>
							<strong>Average Rating:</strong>
							<Rate disabled defaultValue={parseFloat(property.averageRating)} />
							<span style={{ marginLeft: '10px' }}>{property.averageRating || 'No ratings yet'}</span>
						</p>
					</Card>
				</Col>

				{/* Map Section */}
				<Col xs={24} lg={12}>
					<Card title="Property Location" style={{ height: '100%' }}>
						<div style={{ height: '300px', width: '100%' }}>
							<PropertyMap
								properties={[
									{
										_id: property._id,
										address: {
											location: {
												lng: property.address?.location?.lng,
												lat: property.address?.location?.lat,
											},
										},
									},
								]}
								center={[property.address?.location?.lng, property.address?.location?.lat]}
								zoom={15}
								propertyDetails={true}
								disableControls={true} // Add this prop
							/>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Image Grid Section */}
			<Card title="Property Images" style={{ marginTop: '24px' }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
					{property.imageUrls.map((url, index) => (
						<div
							key={index}
							onClick={() => handleImageClick(index)}
							style={{
								position: 'relative',
								aspectRatio: '4/3',
								borderRadius: '8px',
								overflow: 'hidden',
								cursor: 'pointer',
								backgroundColor: '#f0f0f0',
							}}
						>
							<img
								src={url}
								alt={`Property ${index + 1}`}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						</div>
					))}
				</div>
			</Card>

			{/* Reviews Section */}
			<Card title="Reviews" style={{ marginTop: '24px' }}>
				{property.reviews?.length > 0 ? (
					<List
						bordered
						dataSource={property.reviews}
						renderItem={(review) => (
							<List.Item>
								<div style={{ width: '100%' }}>
									<Row gutter={[16, 16]}>
										<Col xs={24} md={8}>
											<p>
												<strong>Reviewer:</strong> {review.reviewer?.name}
											</p>
											<p>
												<strong>Rating:</strong>
												<Rate disabled allowHalf value={review.overallRating || 0} style={{ marginLeft: '5px' }} />
											</p>
										</Col>
										<Col xs={24} md={16}>
											<p>{review.comment}</p>
											{review.media?.length > 0 && (
												<Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
													{review.media.map((url, index) => (
														<Col key={index}>
															<img
																src={url}
																alt="Review Media"
																style={{ width: '100px', height: '100px', objectFit: 'cover' }}
															/>
														</Col>
													))}
												</Row>
											)}
										</Col>
									</Row>
								</div>
							</List.Item>
						)}
					/>
				) : (
					<div
						style={{
							textAlign: 'center',
							padding: '20px 0',
							backgroundColor: '#f9f9f9',
							borderRadius: '8px',
							color: '#888',
							fontSize: '16px',
						}}
					>
						No reviews yet
					</div>
				)}
			</Card>

			{/* Lightbox Modal for Images */}
			<Modal
				open={lightboxVisible}
				onCancel={closeLightbox}
				footer={null}
				width="90%"
				centered
				bodyStyle={{ padding: 0 }}
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
						src={property.imageUrls[currentImage]}
						alt={`Property ${currentImage + 1}`}
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
							onClick={() =>
								setCurrentImage((currentImage - 1 + property.imageUrls.length) % property.imageUrls.length)
							}
						>
							Previous
						</Button>
						<span>{`${currentImage + 1} of ${property.imageUrls.length}`}</span>
						<Button
							type="text"
							style={{ color: '#fff', marginLeft: '10px' }}
							onClick={() => setCurrentImage((currentImage + 1) % property.imageUrls.length)}
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
				style={{ top: 20 }}
				styles={{
					body: {
						height: 'calc(100vh - 180px)',
						overflow: 'auto',
						padding: '24px 24px 0',
					},
					header: {
						position: 'sticky',
						top: 0,
						zIndex: 1,
						backgroundColor: '#fff',
						padding: '16px 24px',
						borderBottom: '1px solid #f0f0f0',
					},
					footer: {
						position: 'sticky',
						bottom: 0,
						zIndex: 1,
						backgroundColor: '#fff',
						padding: '16px 24px',
						borderTop: '1px solid #f0f0f0',
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
