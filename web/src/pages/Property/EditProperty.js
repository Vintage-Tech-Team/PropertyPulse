import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Row, Col, Spin, Modal, Tooltip } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { InfoCircleOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { fetchPropertyById, updateProperty } from '../../services/propertyService';
import { updateAddress } from '../../services/addressService';
import PropertyMap from '../../components/Map/PropertyMap';
import styles from './PropertyForm.module.css';

const { TextArea } = Input;

const MAX_PHOTOS = 8;

const isBill = (file) => file.type === 'electricityBill';

const addressValues = (address) => ({
	houseNumber: address.houseNumber,
	street: address.street,
	block: address.block,
	societyTown: address.societyTown,
	city: address.city,
	lat: address.location?.lat,
	lng: address.location?.lng,
});

const validateImage = (file) => {
	if (!file.type.startsWith('image/')) {
		message.error('You can only upload image files!');
		return Upload.LIST_IGNORE;
	}
	if (file.size / 1024 / 1024 >= 5) {
		message.error('Image must be smaller than 5MB!');
		return Upload.LIST_IGNORE;
	}
	return false; // keep the file locally, it's sent with the form
};

const EditProperty = () => {
	const { id } = useParams();
	const decodedId = decodeURIComponent(id);

	const [form] = Form.useForm();
	const [addressForm] = Form.useForm();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [savingAddress, setSavingAddress] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [defaultCenter, setDefaultCenter] = useState(null);
	const [address, setAddress] = useState(null);
	const [verified, setVerified] = useState(null);
	const [propertyName, setPropertyName] = useState('');
	const [details, setDetails] = useState(null);

	useEffect(() => {
		loadProperty();
		// loadProperty is recreated every render; the property should only reload when the id changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [decodedId]);

	// Fill the forms once they're mounted (they aren't rendered while the page is loading)
	useEffect(() => {
		if (loading) return;
		if (details) form.setFieldsValue(details);
		if (address) addressForm.setFieldsValue(addressValues(address));
	}, [loading, details, address, form, addressForm]);

	const loadProperty = async () => {
		try {
			const data = await fetchPropertyById(decodedId, true);
			setDetails({
				name: data.name,
				description: data.description,
				owner: data.owner,
				consumerId: data.consumerId,
			});
			setVerified(Boolean(data.verified));
			setPropertyName(data.name);

			if (data.address) {
				setAddress(data.address);

				if (data.address.location) {
					const coords = [data.address.location.lng, data.address.location.lat];
					setSelectedLocation(coords);
					setDefaultCenter(coords);
				}
			}

			const images = (data.imageUrls || []).map((url, index) => ({
				uid: `-${index}`,
				name: `Photo ${index + 1}`,
				status: 'done',
				url,
			}));
			const bill = data.electricityBillImage
				? [
						{
							uid: 'electricity-bill',
							name: 'Electricity bill',
							status: 'done',
							url: data.electricityBillImage,
							thumbUrl: data.electricityBillImage,
							type: 'electricityBill',
						},
					]
				: [];
			setFileList([...images, ...bill]);
		} catch (error) {
			message.error('Failed to load property details');
			navigate('/properties');
		} finally {
			setLoading(false);
		}
	};

	const photos = fileList.filter((file) => !isBill(file));
	const billFiles = fileList.filter(isBill);

	const onFinish = async (values) => {
		const validPhotos = photos.filter((file) => file.url || (file.originFileObj && file.status !== 'error'));
		if (validPhotos.length < 2) {
			message.error('At least two property photos are required');
			return;
		}
		const electricityBill = billFiles[0];
		if (!electricityBill) {
			message.error('Electricity bill image is required');
			return;
		}

		setSubmitting(true);
		try {
			await updateProperty(decodedId, {
				...values,
				fileList: photos,
				electricityBill: electricityBill.originFileObj || electricityBill.url,
			});
			message.success('Property updated');
			navigate('/profile?tab=properties');
		} catch (error) {
			console.error('Update error:', error);
			message.error('Failed to update property');
		} finally {
			setSubmitting(false);
		}
	};

	const handleLocationSelect = (coordinates) => {
		const [lng, lat] = coordinates;
		addressForm.setFieldsValue({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
		setSelectedLocation(coordinates);
	};

	const closeAddressModal = () => {
		setIsAddressModalOpen(false);
		// Drop unsaved edits so the modal reopens with the saved address
		if (address) {
			addressForm.setFieldsValue(addressValues(address));
			if (address.location) setSelectedLocation([address.location.lng, address.location.lat]);
		}
	};

	const handleAddressUpdate = async (values) => {
		if (!address?._id) {
			message.error('Address not found');
			return;
		}
		setSavingAddress(true);
		try {
			await updateAddress(address._id, {
				...values,
				location: { lat: parseFloat(values.lat), lng: parseFloat(values.lng) },
			});
			message.success('Address updated');
			setIsAddressModalOpen(false);
			loadProperty();
		} catch (error) {
			message.error('Failed to update address');
		} finally {
			setSavingAddress(false);
		}
	};

	const handlePhotosChange = ({ fileList: newPhotos }) => {
		const updated = newPhotos.map((file) =>
			file.originFileObj && !file.url && file.status !== 'error' ? { ...file, status: 'done' } : file,
		);
		setFileList([...updated, ...billFiles]);
	};

	const handleBillChange = ({ fileList: newBillList }) => {
		const newBill = newBillList[newBillList.length - 1];
		setFileList(newBill ? [...photos, { ...newBill, type: 'electricityBill' }] : photos);
	};

	const handlePreview = (file) => {
		const src = file.url || file.thumbUrl || (file.originFileObj && URL.createObjectURL(file.originFileObj));
		if (src) window.open(src, '_blank', 'noopener');
	};

	if (loading) {
		return (
			<div className={styles.loading}>
				<Spin size="large" />
			</div>
		);
	}

	const addressRows = [
		{ label: 'House no.', value: address?.houseNumber },
		{ label: 'Block', value: address?.block },
		{ label: 'Street', value: address?.street },
		{ label: 'Society / town', value: address?.societyTown },
		{ label: 'City', value: address?.city },
	];

	const uploadTile = (label) => (
		<div>
			<PlusOutlined />
			<div style={{ marginTop: 8 }}>{label}</div>
		</div>
	);

	return (
		<div className={styles.page}>
			<button type="button" className={styles.backLink} onClick={() => navigate('/profile?tab=properties')}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<path d="M19 12H5M11 6l-6 6 6 6" />
				</svg>
				Back to my properties
			</button>

			<div className={styles.headerRow}>
				<div>
					<p className={styles.eyebrow}>Edit listing</p>
					<h1 className={styles.title}>{propertyName || 'Edit property'}</h1>
					<p className={styles.subtitle}>Update the details, photos and location of this property.</p>
				</div>
				{verified !== null && (
					<span className={`${styles.status} ${verified ? styles.statusApproved : styles.statusPending}`}>
						{verified ? 'Approved' : 'Pending review'}
					</span>
				)}
			</div>

			<Form form={form} layout="vertical" onFinish={onFinish}>
				<div className={styles.editLayout}>
					<div className={styles.mainColumn}>
						<Card title="Property information" className={styles.section}>
							<Row gutter={16}>
								<Col xs={24} sm={12}>
									<Form.Item
										name="name"
										label="Property name"
										rules={[{ required: true, whitespace: true, message: 'Please enter the property name' }]}
									>
										<Input maxLength={50} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
									<Form.Item
										name="owner"
										label="Owner name"
										rules={[{ required: true, whitespace: true, message: "Please enter the owner's name" }]}
									>
										<Input maxLength={50} />
									</Form.Item>
								</Col>
							</Row>
							<Form.Item
								name="consumerId"
								label="Consumer ID"
								tooltip="The electricity consumer ID printed on the bill"
								rules={[
									{ required: true, message: 'Consumer ID is required' },
									{ pattern: /^[0-9]{8,}$/, message: 'Please enter a valid consumer ID (minimum 8 digits)' },
								]}
							>
								<Input placeholder="Enter consumer ID" />
							</Form.Item>
							<Form.Item
								name="description"
								label="Description"
								rules={[{ required: true, whitespace: true, message: 'Please enter a description' }]}
							>
								<TextArea rows={4} maxLength={500} showCount />
							</Form.Item>
						</Card>

						<Card
							title="Property photos"
							extra={
								<span className={styles.cardMeta}>
									{photos.length} / {MAX_PHOTOS}
								</span>
							}
							className={styles.section}
						>
							<p className={styles.cardHint}>Add at least 2 photos. The first one is used as the cover.</p>
							<Upload
								multiple
								listType="picture-card"
								fileList={photos}
								onChange={handlePhotosChange}
								onPreview={handlePreview}
								beforeUpload={validateImage}
							>
								{photos.length >= MAX_PHOTOS ? null : uploadTile('Add photo')}
							</Upload>
						</Card>

						<Card title="Electricity bill" className={styles.section}>
							<p className={styles.cardHint}>
								Upload the latest bill so the property can be verified.
							</p>
							<Upload
								maxCount={1}
								listType="picture-card"
								fileList={billFiles}
								onChange={handleBillChange}
								onPreview={handlePreview}
								beforeUpload={validateImage}
							>
								{billFiles.length ? null : uploadTile('Upload bill')}
							</Upload>
						</Card>
					</div>

					<aside className={styles.sideColumn}>
						<Card
							title="Location"
							extra={
								<Button size="small" onClick={() => setIsAddressModalOpen(true)}>
									Change
								</Button>
							}
							className={styles.section}
						>
							<div className={styles.miniMap}>
								<PropertyMap
									draggableMarker={false}
									selectedLocation={selectedLocation}
									center={defaultCenter}
									zoom={13}
									disableControls={true}
									properties={[
										{
											_id: 'current',
											address: { location: { lat: selectedLocation?.[1], lng: selectedLocation?.[0] } },
										},
									]}
								/>
							</div>
							<dl className={styles.addressList}>
								{addressRows.map(({ label, value }) => (
									<div key={label}>
										<dt>{label}</dt>
										<dd>{value || '—'}</dd>
									</div>
								))}
							</dl>
							{address?.location && (
								<p className={styles.coords}>
									<EnvironmentOutlined /> {Number(address.location.lat).toFixed(5)},{' '}
									{Number(address.location.lng).toFixed(5)}
								</p>
							)}
						</Card>

						<div className={styles.sideActions}>
							<Button type="primary" htmlType="submit" size="large" block loading={submitting}>
								Save changes
							</Button>
							<Button size="large" block onClick={() => navigate('/profile?tab=properties')} disabled={submitting}>
								Cancel
							</Button>
						</div>
					</aside>
				</div>
			</Form>

			<Modal title="Change address" open={isAddressModalOpen} onCancel={closeAddressModal} width={960} footer={null} forceRender>
				<Form form={addressForm} layout="vertical" onFinish={handleAddressUpdate}>
					<Row gutter={24}>
						<Col xs={24} md={12}>
							<Row gutter={16}>
								<Col xs={24} sm={12}>
									<Form.Item name="houseNumber" label="House number" rules={[{ required: true, message: 'Required' }]}>
										<Input placeholder="e.g. 12" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12}>
									<Form.Item name="block" label="Block" rules={[{ required: true, message: 'Required' }]}>
										<Input placeholder="e.g. C" />
									</Form.Item>
								</Col>
							</Row>
							<Form.Item name="street" label="Street" rules={[{ required: true, message: 'Required' }]}>
								<Input placeholder="Street" />
							</Form.Item>
							<Form.Item name="societyTown" label="Society / town" rules={[{ required: true, message: 'Required' }]}>
								<Input placeholder="Society or town" />
							</Form.Item>
							<Form.Item name="city" label="City" rules={[{ required: true, message: 'Required' }]}>
								<Input placeholder="City" />
							</Form.Item>
							<Row gutter={16}>
								{['lat', 'lng'].map((field) => (
									<Col xs={12} key={field}>
										<Form.Item
											name={field}
											label={
												<span>
													{field === 'lat' ? 'Latitude' : 'Longitude'}
													<Tooltip title="Click on the map to set the exact location">
														<InfoCircleOutlined style={{ marginLeft: 8 }} />
													</Tooltip>
												</span>
											}
											rules={[{ required: true, message: 'Pick a point on the map' }]}
										>
											<Input readOnly />
										</Form.Item>
									</Col>
								))}
							</Row>
						</Col>
						<Col xs={24} md={12}>
							<div className={styles.modalMap}>
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
											address: { location: { lat: defaultCenter?.[1], lng: defaultCenter?.[0] } },
										},
									]}
								/>
							</div>
						</Col>
					</Row>
					<div className={styles.modalActions}>
						<Button onClick={closeAddressModal}>Cancel</Button>
						<Button type="primary" htmlType="submit" loading={savingAddress}>
							Save address
						</Button>
					</div>
				</Form>
			</Modal>
		</div>
	);
};

export default EditProperty;
