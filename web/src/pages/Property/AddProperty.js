import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Row, Col, Select, Tooltip, Modal } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { addProperty } from '../../services/propertyService';
import { addAddress } from '../../services/addressService'; // Import the addAddress function
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from '../../utils/token';
import PropertyMap from '../../components/Map/PropertyMap';
import { PAKISTANI_CITIES, PAKISTANI_PROVINCES } from '../../utils/constants';
import styles from './PropertyForm.module.css';

const { Option } = Select;
const { TextArea } = Input;

const AddProperty = () => {
	const [form] = Form.useForm();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [defaultCenter, setDefaultCenter] = useState(null);

	const navigate = useNavigate();

	// Set initial form values
	useEffect(() => {
		form.setFieldsValue({
			country: 'Pakistan',
		});
	}, [form]);

	// Handle location selection from map
	const handleLocationSelect = (coordinates) => {
		const [lng, lat] = coordinates;
		form.setFieldsValue({
			lat: lat.toFixed(6),
			lng: lng.toFixed(6),
		});
		setSelectedLocation(coordinates);
	};

	const handlePlaceSelect = ({ coordinates, city, fullAddress }) => {
		const [lng, lat] = coordinates;

		// Update coordinates
		form.setFieldsValue({
			lat: lat.toFixed(6),
			lng: lng.toFixed(6),
		});
		setSelectedLocation(coordinates);

		// If city is available and matches our list, select it
		if (city) {
			const matchedCity = Object.values(PAKISTANI_CITIES).find((c) => c.name.toLowerCase() === city.toLowerCase());
			if (matchedCity) {
				form.setFieldsValue({
					city: matchedCity.name,
					state: matchedCity.province,
				});
			}
		}
	};

	// Add validator function
	const validateNonEmpty = (rule, value) => {
		if (!value || !value.trim()) {
			return Promise.reject('This field cannot be empty or contain only whitespace');
		}
		if (value.trim() !== value) {
			return Promise.reject('This field cannot start or end with whitespace');
		}
		return Promise.resolve();
	};

	// Update handleSubmit to include default country
	const handleSubmit = async (values) => {
		try {
			setIsSubmitting(true);

			// Extract address-related fields
			const addressData = {
				street: values.street,
				block: values.block,
				societyTown: values.societyTown,
				houseNumber: values.houseNumber,
				apartmentNumber: values.apartmentNumber,
				city: values.city,
				state: values.state,
				postalCode: '54000',
				country: 'Pakistan', // Set default country
				location: {
					lat: parseFloat(values.lat),
					lng: parseFloat(values.lng),
				},
			};

			// Create address and get the ID
			const addressResponse = await addAddress(addressData);
			const addressId = addressResponse.address._id;

			const userId = getUserIdFromToken(); // Get user ID from token
			// Prepare property data
			const propertyData = {
				name: values.name,
				description: values.description,
				owner: values.owner,
				createdBy: userId,
				address: addressId, // Use the created address ID
				consumerId: values.consumerId,
			};

			const formData = new FormData();
			Object.keys(propertyData).forEach((key) => {
				if (key !== 'electricityBill') {
					// Skip electricityBill as we'll handle it separately
					formData.append(key, propertyData[key]);
				}
			});

			// Handle property images
			const images = values.images || [];
			if (images.length < 2) {
				message.error('You must upload at least 2 images.');
				setIsSubmitting(false);
				return;
			}

			images.forEach((image) => {
				if (image.originFileObj) {
					formData.append('images', image.originFileObj);
				}
			});

			// Handle electricity bill image
			const electricityBill = values.electricityBill?.fileList?.[0];
			if (electricityBill?.originFileObj) {
				formData.append('electricityBill', electricityBill.originFileObj);
			} else {
				message.error('Electricity bill image is required');
				setIsSubmitting(false);
				return;
			}

			// Add the property
			await addProperty(formData);
			message.success('Property added successfully!');
			form.resetFields(); // Reset the form after successful submission
			navigate(`/properties`);
		} catch (err) {
			if (err.existingPropertyId) {
				Modal.confirm({
					title: 'Property Already Exists',
					content: 'A property with this Consumer ID is already registered. Would you like to view it?',
					okText: 'View Property',
					cancelText: 'Stay Here',
					onOk: () => {
						navigate(`/properties/${err.existingPropertyId}`);
					},
				});
			} else {
				message.error('Failed to add property');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={styles.page}>
			<button type="button" className={styles.backLink} onClick={() => navigate('/properties')}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<path d="M19 12H5M11 6l-6 6 6 6" />
				</svg>
				Back to Discover
			</button>
			<p className={styles.eyebrow}>List a property</p>
			<h1 className={styles.title}>Add a property</h1>
			<p className={styles.subtitle}>Share a place you've lived in so others can read and write honest reviews about it.</p>

			<Form form={form} onFinish={handleSubmit} layout="vertical">
				<Row gutter={24}>
					{/* Left Column - Property Details */}
					<Col xs={24} lg={12}>
						<Card title="Property information" className={styles.section}>
							{/* Property Fields */}

							{/* Property Name and Owner in one line */}
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										name="name"
										label="Property Name"
										tooltip="Enter the official name of the property (3-50 characters)"
										rules={[
											{ required: true, message: 'Property name is required' },
											{ validator: validateNonEmpty },
											{ min: 3, message: 'Name must be at least 3 characters' },
											{ max: 50, message: 'Name cannot exceed 50 characters' },
											{
												pattern: /^[a-zA-Z0-9\s\-,.()&']+$/,
												message: 'Only letters, numbers, spaces and basic punctuation are allowed',
											},
										]}
									>
										<Input placeholder="Enter property name" maxLength={50} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										name="owner"
										label="Owner Name"
										tooltip="Full name of the property owner"
										rules={[
											{ required: true, message: 'Owner is required' },
											{ validator: validateNonEmpty },
											{ min: 3, message: 'Name must be at least 3 characters' },
											{ max: 50, message: 'Name cannot exceed 50 characters' },
											{
												pattern: /^[a-zA-Z\s.'-]+$/,
												message: 'Owner name can only contain letters, spaces, hyphens, apostrophes and periods',
											},
										]}
									>
										<Input placeholder="Owner Name" maxLength={50} />
									</Form.Item>
								</Col>
							</Row>

							{/* Description */}
							<Form.Item
								name="description"
								label="Description"
								tooltip="Provide details about the property (max 500 characters)"
								rules={[
									{ required: true, message: 'Description is required' },
									{ validator: validateNonEmpty },
									{ max: 500, message: 'Description cannot exceed 500 characters' },
								]}
							>
								<TextArea rows={3} placeholder="Description" maxLength={500} showCount />
							</Form.Item>

							{/* Add Consumer ID field */}
							<Form.Item
								name="consumerId"
								label="Consumer ID"
								tooltip="Enter the electricity consumer ID"
								rules={[
									{ required: true, message: 'Consumer ID is required' },
									{ pattern: /^[0-9]{8,}$/, message: 'Please enter a valid consumer ID (minimum 8 digits)' },
								]}
							>
								<Input placeholder="Enter Consumer ID" />
							</Form.Item>

							{/* Add Electricity Bill Upload */}
							<Form.Item
								name="electricityBill"
								label="Electricity Bill"
								tooltip="Upload latest electricity bill"
								rules={[{ required: true, message: 'Electricity bill is required' }]}
							>
								<Upload
									maxCount={1}
									listType="picture-card"
									beforeUpload={(file) => {
										const isImage = file.type.startsWith('image/');
										if (!isImage) {
											message.error('You can only upload image files!');
											return false;
										}
										const isLt5M = file.size / 1024 / 1024 < 5;
										if (!isLt5M) {
											message.error('Image must be smaller than 5MB!');
											return false;
										}
										return false; // Prevent auto upload
									}}
								>
									<div>
										<PlusOutlined />
										<div style={{ marginTop: 8 }}>Upload Bill</div>
									</div>
								</Upload>
							</Form.Item>

							{/* Address Fields - Improved Mobile Layout */}
							<Row gutter={[16, 16]}>
								<Col xs={24} sm={12}>
									<Form.Item
										name="houseNumber"
										label="House No."
										tooltip="House or building number"
										rules={[
											{ max: 10, message: 'House number cannot exceed 10 characters' },
											{
												pattern: /^[a-zA-Z0-9\-/]*$/,
												message: 'Only letters, numbers, hyphens and slashes allowed',
											},
										]}
									>
										<Input placeholder="House No." maxLength={10} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
									<Form.Item
										name="block"
										label="Block No."
										tooltip="Block"
										rules={[
											{ max: 10, message: 'Block cannot exceed 10 characters' },
											{
												pattern: /^[a-zA-Z0-9\-/]*$/,
												message: 'Only letters, numbers, hyphens and slashes allowed',
											},
										]}
									>
										<Input placeholder="Block" maxLength={10} />
									</Form.Item>
								</Col>
								<Col xs={24}>
									<Form.Item
										name="street"
										label="Street"
										tooltip="Street name (letters, numbers, and basic punctuation allowed)"
										rules={[
											{ required: true, message: 'Street is required' },
											{ validator: validateNonEmpty },
											{
												pattern: /^[a-zA-Z0-9\s\-,.#\/()]+$/,
												message: 'Street can only contain letters, numbers and basic punctuation',
											},
											{ max: 100, message: 'Street name cannot exceed 100 characters' },
										]}
									>
										<Input placeholder="Street" maxLength={100} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
									<Form.Item
										name="apartmentNumber"
										label="Apt No."
										tooltip="Apartment, suite, or unit number"
										rules={[
											{ max: 10, message: 'Apartment number cannot exceed 10 characters' },
											{
												pattern: /^[a-zA-Z0-9\-/]*$/,
												message: 'Only letters, numbers, hyphens and slashes allowed',
											},
										]}
									>
										<Input placeholder="Apt No." maxLength={10} />
									</Form.Item>
								</Col>
								<Col xs={24}>
									<Form.Item
										name="societyTown"
										label="Society/Town"
										tooltip="Society/Town name and details"
										rules={[
											{ required: true, message: 'Society/Town is required' },
											{ validator: validateNonEmpty },
											{ max: 100, message: 'Society/Town name cannot exceed 100 characters' },
										]}
									>
										<Input placeholder="Enter society or town name" maxLength={100} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
									<Form.Item
										name="city"
										label="City"
										tooltip="City will be automatically determined from the map location"
										rules={[{ required: true, message: 'City is required' }]}
									>
										<Select
											disabled
											placeholder="City will be set from map location"
											showSearch
											filterOption={(input, option) =>
												option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}
										>
											{Object.values(PAKISTANI_CITIES).map((city) => (
												<Option key={city.name} value={city.name}>
													{city.name}
												</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
							</Row>

							{/* Hidden province field for API submission */}
							<Form.Item name="state" hidden rules={[{ required: true, message: 'Province is required' }]}>
								<Input />
							</Form.Item>

							{/* Coordinates Row */}
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										name="lat"
										label={
											<span>
												Latitude
												<Tooltip title="Click on the map to set the exact location">
													<InfoCircleOutlined style={{ marginLeft: 8 }} />
												</Tooltip>
											</span>
										}
										rules={[{ required: true, message: 'Latitude is required' }]}
									>
										<Input placeholder="Click on map or use current location" readOnly />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										name="lng"
										label={
											<span>
												Longitude
												<Tooltip title="Click on the map to set the exact location">
													<InfoCircleOutlined style={{ marginLeft: 8 }} />
												</Tooltip>
											</span>
										}
										rules={[{ required: true, message: 'Longitude is required' }]}
									>
										<Input placeholder="Click on map or use current location" readOnly />
									</Form.Item>
								</Col>
							</Row>
						</Card>
					</Col>

					{/* Right Column - Map and Images */}
					<Col xs={24} lg={12}>
						{/* Map Section */}
						<Card title="Location" className={styles.section}>
							<div className={styles.mapBox}>
								<PropertyMap
									draggableMarker={true}
									onLocationSelect={handleLocationSelect}
									onPlaceSelect={handlePlaceSelect}
									selectedLocation={selectedLocation}
									center={defaultCenter}
									zoom={defaultCenter ? 12 : undefined}
								/>
							</div>
						</Card>

						{/* Images Upload Section */}
						<Card title="Property photos" className={styles.section}>
							<Form.Item
								name="images"
								valuePropName="fileList"
								getValueFromEvent={(e) => e?.fileList}
								tooltip="Upload at least 2 high-quality images of the property"
								rules={[
									{
										validator: (_, fileList) =>
											fileList?.length >= 2
												? Promise.resolve()
												: Promise.reject(new Error('You must upload at least 2 images.')),
									},
								]}
							>
								<Upload
									listType="picture-card"
									multiple
									beforeUpload={(file) => {
										const isImage = file.type.startsWith('image/');
										if (!isImage) {
											message.error('You can only upload image files!');
											return false;
										}

										const isLt5M = file.size / 1024 / 1024 < 5;
										if (!isLt5M) {
											message.error('Image must be smaller than 5MB!');
											return false;
										}

										// Check image dimensions
										return new Promise((resolve, reject) => {
											const reader = new FileReader();
											reader.readAsDataURL(file);
											reader.onload = (e) => {
												const img = new Image();
												img.src = e.target.result;
												img.onload = () => {
													const aspectRatio = img.width / img.height;
													// Allow aspect ratios between 3:4 and 16:9
													if (aspectRatio < 0.75 || aspectRatio > 1.78) {
														message.warning('For best results, upload images with aspect ratio between 3:4 and 16:9');
													}
													resolve(false); // Prevent auto upload
												};
											};
										});
									}}
									onPreview={async (file) => {
										const src = file.url || URL.createObjectURL(file.originFileObj);
										const imgWindow = window.open(src);
										const img = new Image();
										img.src = src;
										imgWindow.document.write(img.outerHTML);
									}}
								>
									<div>
										<PlusOutlined />
										<div style={{ marginTop: 8 }}>Upload</div>
										<div className={styles.uploadHint}>16:9 or 4:3</div>
									</div>
								</Upload>
							</Form.Item>
						</Card>
					</Col>
				</Row>

				{/* Submit Buttons */}
				<div className={styles.actions}>
					<Button size="large" onClick={() => navigate('/properties')} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
						Add property
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default AddProperty;
