import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Row, Col, Spin, Modal, Tooltip } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchPropertyById, updateProperty } from '../../services/propertyService';
import { updateAddress } from '../../services/addressService';
import PropertyMap from '../../components/Map/PropertyMap';

const { TextArea } = Input;

const EditProperty = () => {
	const { id } = useParams();
	const decodedId = decodeURIComponent(id);

	const [form] = Form.useForm();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
	const [addressForm] = Form.useForm();
	const navigate = useNavigate();
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [defaultCenter, setDefaultCenter] = useState(null);
	const [addressId, setAddressId] = useState(null); // Add state for addressId

	useEffect(() => {
		loadProperty();
	}, [decodedId]);

	const loadProperty = async () => {
		try {
			const data = await fetchPropertyById(decodedId, true);
			form.setFieldsValue({
				name: data.name,
				description: data.description,
				owner: data.owner,
				consumerId: data.consumerId,
			});

			// Set address form values and addressId
			if (data.address) {
				setAddressId(data.address._id); // Set the address ID
				addressForm.setFieldsValue({
					houseNumber: data.address?.houseNumber,
					street: data.address?.street,
					block: data.address?.block,
					societyTown: data.address?.societyTown,
					city: data.address?.city,
					lat: data.address?.location?.lat,
					lng: data.address?.location?.lng,
				});

				// Set map location
				if (data.address?.location) {
					setSelectedLocation([data.address.location.lng, data.address.location.lat]);
					setDefaultCenter([data.address.location.lng, data.address.location.lat]);
				}
			}

			// Set existing images if any
			if (data.imageUrls) {
				setFileList(
					data.imageUrls.map((url, index) => ({
						uid: `-${index}`,
						name: `Image ${index + 1}`,
						status: 'done',
						url: url,
					})),
				);
			}

			// Set electricity bill image if exists
			if (data.electricityBillImage) {
				setFileList((prev) => [
					...prev,
					{
						uid: 'electricity-bill',
						name: 'Electricity Bill',
						status: 'done',
						url: data.electricityBillImage,
						type: 'electricityBill',
					},
				]);
			}
		} catch (error) {
			message.error('Failed to load property details');
			navigate('/properties');
		} finally {
			setLoading(false);
		}
	};

	const onFinish = async (values) => {
		setSubmitting(true);
		try {
			// Validate required fields
			if (!values.name || !values.description || !values.owner || !values.consumerId) {
				message.error('Please fill in all required fields');
				return;
			}

			// Separate electricity bill from regular images
			const regularImages = fileList.filter((file) => !file.type || file.type !== 'electricityBill');
			const electricityBill = fileList.find((file) => file.type === 'electricityBill');

			// Validate images
			const totalValidImages = regularImages.filter(
				(file) => file.url || (file.originFileObj && file.status !== 'error'),
			).length;

			if (totalValidImages < 2) {
				message.error('At least two property images are required');
				return;
			}

			if (!electricityBill) {
				message.error('Electricity bill image is required');
				return;
			}

			await updateProperty(decodedId, {
				...values,
				fileList: regularImages,
				electricityBill: electricityBill.originFileObj || electricityBill.url,
			});

			message.success('Property updated successfully');
			navigate('/profile?tab=properties');
		} catch (error) {
			console.error('Update error:', error);
			message.error('Failed to update property');
		} finally {
			setSubmitting(false);
		}
	};

	// Handle location selection from map
	const handleLocationSelect = (coordinates) => {
		const [lng, lat] = coordinates;
		addressForm.setFieldsValue({
			lat: lat.toFixed(6),
			lng: lng.toFixed(6),
		});
		setSelectedLocation(coordinates);
	};

	const handleAddressUpdate = async (values) => {
		try {
			if (!addressId) {
				message.error('Address ID not found');
				return;
			}

			// Update address separately
			const addressData = {
				...values,
				location: {
					lat: parseFloat(values.lat),
					lng: parseFloat(values.lng),
				},
			};

			await updateAddress(addressId, addressData);
			message.success('Address updated successfully');
			setIsAddressModalVisible(false);
			loadProperty(); // Reload data
		} catch (error) {
			message.error('Failed to update address');
		}
	};

	if (loading) {
		return <Spin size="large" />;
	}

	return (
		<div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 20px' }}>
			<Card title="Edit Property">
				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
					initialValues={{
						name: form.getFieldValue('name'),
						description: form.getFieldValue('description'),
						owner: form.getFieldValue('owner'),
					}}
				>
					{/* Property Info Row */}
					<Row gutter={16}>
						<Col xs={24} md={8}>
							<Form.Item
								name="name"
								label="Property Name"
								rules={[{ required: true, message: 'Please enter property name' }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} md={8}>
							<Form.Item
								name="owner"
								label="Owner Name"
								rules={[{ required: true, message: 'Please enter owner name' }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} md={8}>
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
						</Col>
					</Row>

					<Form.Item
						name="description"
						label="Description"
						rules={[{ required: true, message: 'Please enter description' }]}
					>
						<TextArea rows={4} />
					</Form.Item>

					{/* Images Row */}
					<Row gutter={16}>
						<Col xs={24} md={8}>
							<Form.Item name="electricityBill" label="Electricity Bill" tooltip="Upload latest electricity bill">
								<Upload
									maxCount={1}
									listType="picture-card"
									fileList={fileList.filter((file) => file.type === 'electricityBill')}
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
										return false;
									}}
									onChange={({ fileList: newFileList }) => {
										const filteredList = fileList.filter((file) => file.type !== 'electricityBill');
										const newBill = newFileList[0];
										if (newBill) {
											newBill.type = 'electricityBill';
											setFileList([...filteredList, newBill]);
										} else {
											setFileList(filteredList);
										}
									}}
								>
									{fileList.some((file) => file.type === 'electricityBill') ? null : (
										<div>
											<PlusOutlined />
											<div style={{ marginTop: 8 }}>Upload Bill</div>
										</div>
									)}
								</Upload>
							</Form.Item>
						</Col>
						<Col xs={24} md={16}>
							<Form.Item label="Property Images" extra="At least 2 images are required">
								<Upload
									multiple
									listType="picture-card"
									fileList={fileList.filter((file) => !file.type || file.type !== 'electricityBill')}
									onChange={({ fileList: newFileList }) => {
										const updatedFileList = newFileList.map((file) => {
											if (file.originFileObj && !file.url && file.status !== 'error') {
												return { ...file, status: 'done' };
											}
											return file;
										});
										const existingBill = fileList.find((file) => file.type === 'electricityBill');
										setFileList(existingBill ? [...updatedFileList, existingBill] : updatedFileList);
									}}
									beforeUpload={() => false}
								>
									{fileList.filter((file) => !file.type || file.type !== 'electricityBill').length >= 8 ? null : (
										<div>
											<UploadOutlined />
											<div style={{ marginTop: 8 }}>Add Image</div>
										</div>
									)}
								</Upload>
							</Form.Item>
						</Col>
					</Row>

					{/* Address Display */}
					<Card
						title="Property Address"
						bordered={false}
						extra={
							<Button type="primary" onClick={() => setIsAddressModalVisible(true)}>
								Update Address
							</Button>
						}
					>
						<Row gutter={16}>
							<Col xs={24} sm={12} md={8}>
								<p style={{ margin: '0 0 8px 0', lineHeight: '1.6', fontSize: '14px' }}>
									<strong>House No.:</strong> {addressForm.getFieldValue('houseNumber') || 'N/A'}
									<br />
									<strong>Street:</strong> {addressForm.getFieldValue('street') || 'N/A'}
									<br />
									<strong>Block:</strong> {addressForm.getFieldValue('block') || 'N/A'}
								</p>
							</Col>
							<Col xs={24} sm={12} md={8}>
								<p style={{ margin: '0 0 8px 0', lineHeight: '1.6', fontSize: '14px' }}>
									<strong>Society/Town:</strong> {addressForm.getFieldValue('societyTown') || 'N/A'}
									<br />
									<strong>City:</strong> {addressForm.getFieldValue('city') || 'N/A'}
									<br />
									<strong>Coordinates:</strong> {addressForm.getFieldValue('lat')}, {addressForm.getFieldValue('lng')}
								</p>
							</Col>
							<Col xs={24} md={8}>
								<div style={{ height: '120px', marginTop: '8px' }}>
									<PropertyMap
										draggableMarker={false}
										selectedLocation={selectedLocation}
										center={defaultCenter}
										zoom={13}
										disableControls={true}
										properties={[
											{
												_id: 'current',
												address: {
													location: {
														lat: selectedLocation?.[1],
														lng: selectedLocation?.[0],
													},
												},
											},
										]}
									/>
								</div>
							</Col>
						</Row>
					</Card>

					<Form.Item>
						<Button type="primary" htmlType="submit" loading={submitting}>
							Update Property
						</Button>
						<Button style={{ marginLeft: 8 }} onClick={() => navigate('/profile?tab=properties')}>
							Cancel
						</Button>
					</Form.Item>
				</Form>
			</Card>

			{/* Address Update Modal */}
			<Modal
				title="Update Address"
				open={isAddressModalVisible}
				onCancel={() => setIsAddressModalVisible(false)}
				width={1000}
				footer={null}
			>
				<Form form={addressForm} layout="vertical" onFinish={handleAddressUpdate}>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							{/* Address fields */}
							<Row gutter={[16, 16]}>
								<Col xs={24} sm={12}>
									<Form.Item name="houseNumber" label="House Number" rules={[{ required: true }]}>
										<Input placeholder="Enter house number" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
									<Form.Item name="block" label="Block" rules={[{ required: true }]}>
										<Input placeholder="Enter block" />
									</Form.Item>
								</Col>
								<Col xs={24}>
									<Form.Item name="street" label="Street" rules={[{ required: true }]}>
										<Input placeholder="Enter street" />
									</Form.Item>
								</Col>
								<Col xs={24}>
									<Form.Item name="societyTown" label="Society/Town" rules={[{ required: true }]}>
										<Input placeholder="Enter society or town" />
									</Form.Item>
								</Col>
								<Col xs={24}>
									<Form.Item name="city" label="City" rules={[{ required: true }]}>
										<Input placeholder="Enter city" />
									</Form.Item>
								</Col>
							</Row>

							{/* Coordinates inputs */}
							<Row gutter={[16, 16]}>
								<Col xs={24} sm={12}>
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
										rules={[{ required: true }]}
									>
										<Input readOnly />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
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
										rules={[{ required: true }]}
									>
										<Input readOnly />
									</Form.Item>
								</Col>
							</Row>
						</Col>
						<Col xs={24} md={12}>
							{/* Map Section */}
							<div style={{ height: '400px', marginBottom: '20px' }}>
								<PropertyMap
									draggableMarker={true}
									onLocationSelect={handleLocationSelect}
									selectedLocation={selectedLocation}
									center={defaultCenter}
									zoom={15}
									disableControls={false}
									properties={[
										{
											_id: 'current',
											address: {
												location: {
													lat: defaultCenter?.[1],
													lng: defaultCenter?.[0],
												},
											},
										},
									]}
								/>
							</div>
						</Col>
					</Row>

					<Row justify="end" gutter={8}>
						<Col>
							<Button onClick={() => setIsAddressModalVisible(false)}>Cancel</Button>
						</Col>
						<Col>
							<Button type="primary" htmlType="submit">
								Update Address
							</Button>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default EditProperty;
