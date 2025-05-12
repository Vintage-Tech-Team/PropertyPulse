import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, message, Tag, Empty, Row, Col, Statistic, Button, Popconfirm, Image } from 'antd';
import { fetchPropertyById, updateProperty } from '../services/propertyService';

const PropertyDetails = () => {
	const defaultImageUrl = 'https://via.placeholder.com/400x300?text=No+Image+Available';
	const { id } = useParams();
	const [property, setProperty] = useState(null);

	// Memoized function to load property details
	const loadPropertyDetails = useCallback(async () => {
		try {
			const data = await fetchPropertyById(id);
			setProperty(data);
		} catch (err) {
			message.error('Failed to fetch property details');
		}
	}, [id]); // Re-create the function only when `id` changes

	useEffect(() => {
		loadPropertyDetails(); // Call the function
	}, [loadPropertyDetails]); // Add `loadPropertyDetails` as a dependency

	const handleApprove = async () => {
		try {
			await updateProperty(id, { ...property, verified: true });
			message.success('Property approved successfully!');
			loadPropertyDetails();
		} catch (err) {
			message.error('Failed to approve property');
		}
	};

	const handleUnapprove = async () => {
		try {
			await updateProperty(id, { ...property, verified: false });
			message.success('Property unapproved successfully!');
			loadPropertyDetails();
		} catch (err) {
			message.error('Failed to unapprove property');
		}
	};

	if (!property) return <div>Loading...</div>;

	return (
		<div style={{ padding: '20px' }}>
			<Card
				title={property.name}
				extra={
					<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
						{property.verified ? <Tag color="green">Verified</Tag> : <Tag color="red">Not Verified</Tag>}
						<Popconfirm
							title={
								property.verified
									? 'Are you sure you want to unapprove this property?'
									: 'Are you sure you want to approve this property?'
							}
							onConfirm={property.verified ? handleUnapprove : handleApprove}
							okText="Yes"
							cancelText="No"
						>
							<Button type="primary">{property.verified ? 'Unapprove' : 'Approve'}</Button>
						</Popconfirm>
					</div>
				}
				style={{ marginBottom: '20px' }}
			>
				<Row gutter={[16, 16]}>
					<Col span={12}>
						<p>
							<strong>Owner:</strong> {property.owner}
						</p>
						<p>
							<strong>Description:</strong> {property.description}
						</p>
						<p>
							<strong>Address:</strong> {property.address?.street}, {property.address?.city}, {property.address?.state}{' '}
							{property.address?.postalCode}, {property.address?.country}
						</p>
						{property.address?.location && (
							<p>
								<strong>Location:</strong> {property.address.location.lat}, {property.address.location.lng}
							</p>
						)}
					</Col>
					<Col span={12}>
						<Row gutter={16}>
							<Col span={12}>
								<Statistic
									title="Average Rating"
									value={property.averageRating || 'No ratings'}
									suffix={property.averageRating ? '/5' : ''}
								/>
							</Col>
							<Col span={12}>
								<Statistic title="Total Reviews" value={property.ratings?.length || 0} />
							</Col>
						</Row>
						<p style={{ marginTop: '20px' }}>
							<strong>Created:</strong> {new Date(property.createdAt).toLocaleDateString()}
						</p>
						<p>
							<strong>Last Updated:</strong> {new Date(property.updatedAt).toLocaleDateString()}
						</p>
					</Col>
				</Row>
			</Card>

			{/* Image Grid */}
			<Card title="Property Images">
				{property.imageUrls?.length > 0 ? (
					<Row gutter={[16, 16]}>
						{property.imageUrls.map((url, index) => (
							<Col key={index} xs={24} sm={12} md={8} lg={6}>
								<Image
									src={url}
									alt={`Property ${index + 1}`}
									style={{
										width: '100%',
										height: '200px',
										objectFit: 'cover',
										cursor: 'pointer',
									}}
									onError={(e) => {
										e.target.src = defaultImageUrl;
									}}
									preview={{
										mask: 'Click to preview',
									}}
								/>
							</Col>
						))}
					</Row>
				) : (
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<img
							src={defaultImageUrl}
							alt="Default property"
							style={{ width: '100%', height: '400px', objectFit: 'cover' }}
						/>
					</div>
				)}
			</Card>

			{/* Electricity Bill Details */}
			<Card title="Electricity Details" style={{ marginTop: '20px' }}>
				<Row gutter={[16, 16]}>
					<Col span={12}>
						<p>
							<strong>Consumer ID:</strong> {property.consumerId || 'N/A'}
						</p>
					</Col>
					<Col span={24}>
						<p>
							<strong>Electricity Bill:</strong>
						</p>
						{property.electricityBillImage ? (
							<Image
								src={property.electricityBillImage}
								alt="Electricity Bill"
								style={{
									maxWidth: '100%',
									height: 'auto',
								}}
								preview={{
									mask: 'Click to preview',
								}}
							/>
						) : (
							<Empty description="No bill image available" />
						)}
					</Col>
				</Row>
			</Card>

			{/* Reviews */}
			{property.reviews?.length > 0 && (
				<List
					header={<strong>Reviews</strong>}
					bordered
					dataSource={property.reviews}
					renderItem={(review) => (
						<List.Item>
							<div>
								<p>
									<strong>Reviewer:</strong> {review.reviewer?.name}
								</p>
								<p>
									<strong>Rating:</strong> {review.overallRating}
								</p>
								<p>{review.comment}</p>
							</div>
						</List.Item>
					)}
				/>
			)}
		</div>
	);
};

export default PropertyDetails;
