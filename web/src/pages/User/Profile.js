import React, { useState, useEffect } from 'react';
import {
	Card,
	Spin,
	message,
	List,
	Button,
	Tabs,
	Avatar,
	Upload,
	Form,
	Input,
	Modal,
	Row,
	Col,
	Tag,
	Empty,
	Rate,
	Grid,
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile } from '../../services/authService';
import { updateUserProfile, updateUserPassword } from '../../services/userService';
import { EditOutlined, UploadOutlined, UserOutlined, HomeOutlined, StarOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { useBreakpoint } = Grid;

const Profile = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('profile');
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editMode, setEditMode] = useState(false);
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [passwordForm] = Form.useForm();
	const { isDarkMode } = useTheme();
	const [fileList, setFileList] = useState([]);
	const [imageUrl, setImageUrl] = useState(null);
	const screens = useBreakpoint();

	const cardStyle = {
		backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
		color: isDarkMode ? '#ffffff' : '#000000',
	};

	// Load user data only once when component mounts
	useEffect(() => {
		loadUserProfile();
	}, []); // Empty dependency array means it only runs once on mount

	// Handle tab changes from URL
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const tabFromUrl = searchParams.get('tab');
		if (tabFromUrl) {
			setActiveTab(tabFromUrl);
		}
	}, [location.search]);

	// Fetch user profile
	const loadUserProfile = async () => {
		try {
			const data = await getUserProfile();
			setUser(data);
		} catch (err) {
			message.error('Failed to load user profile');
		} finally {
			setLoading(false);
		}
	};

	// Profile update handler
	const handleProfileUpdate = async (values) => {
		try {
			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('phone', values.phone || '');
			formData.append('address', values.address || '');

			// If there's a file upload
			if (fileList.length > 0) {
				formData.append('profileImage', fileList[0].originFileObj);
			}

			await updateUserProfile(formData);
			message.success('Profile updated successfully');
			setEditMode(false);
			setFileList([]); // Reset file list
			loadUserProfile();
		} catch (error) {
			message.error(error.response?.data?.message || 'Failed to update profile');
		}
	};

	// Password update handler
	const handlePasswordUpdate = async (values) => {
		try {
			await updateUserPassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
			message.success('Password updated successfully');
			setPasswordModalVisible(false);
			passwordForm.resetFields();
		} catch (error) {
			message.error(error.response?.data?.message || 'Failed to update password');
		}
	};

	// Update file change handler
	const handleFileChange = ({ fileList: newFileList }) => {
		setFileList(newFileList);
		if (newFileList.length > 0) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setImageUrl(e.target.result);
			};
			reader.readAsDataURL(newFileList[0].originFileObj);
		} else {
			setImageUrl(null);
		}
	};

	const handleRemove = () => {
		setFileList([]);
		setImageUrl(null);
	};

	const handleTabChange = (key) => {
		setActiveTab(key);
		navigate(`/profile?tab=${key}`, { replace: true });
	};

	// Memoize the tab content components to prevent unnecessary re-renders
	const ProfileInfo = React.memo(() => (
		<div style={{ padding: screens.xs ? '0 12px' : '20px 0' }}>
			{!editMode ? (
				<Row gutter={[24, 24]} align="top">
					<Col xs={24} sm={8} style={{ textAlign: 'center' }}>
						<Avatar
							size={200}
							src={user?.user?.profileImage}
							icon={<UserOutlined />}
							style={{ marginBottom: '20px' }}
						/>
						<Button
							type="primary"
							icon={<EditOutlined />}
							onClick={() => {
								setEditMode(true);
								form.setFieldsValue({
									name: user?.user?.name,
									phone: user?.user?.phone,
									address: user?.user?.address,
								});
							}}
							block
						>
							Edit Profile
						</Button>
						<Button type="default" onClick={() => setPasswordModalVisible(true)} block style={{ marginTop: '10px' }}>
							Change Password
						</Button>
					</Col>
					<Col xs={24} sm={16}>
						<Card style={cardStyle} bordered={false}>
							<h2>{user?.user?.name}</h2>
							<p>
								<strong>Email:</strong> {user?.user?.email}
							</p>
							<p>
								<strong>Phone:</strong> {user?.user?.phone || 'Not provided'}
							</p>
							<p>
								<strong>Address:</strong> {user?.user?.address || 'Not provided'}
							</p>
							<p>
								<strong>Role:</strong> <Tag color="blue">{user?.user?.role}</Tag>
							</p>
							<p>
								<strong>Member Since:</strong> {new Date(user?.user?.createdAt).toLocaleDateString()}
							</p>
						</Card>
					</Col>
				</Row>
			) : (
				<Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
					<Row gutter={[24, 24]}>
						<Col xs={24} sm={8} style={{ textAlign: 'center' }}>
							<Upload
								name="profileImage"
								fileList={fileList}
								onChange={handleFileChange}
								onRemove={handleRemove}
								beforeUpload={() => false}
								maxCount={1}
								showUploadList={{
									showPreviewIcon: false,
									showRemoveIcon: true,
									showDownloadIcon: false,
								}}
							>
								<Avatar
									size={200}
									src={imageUrl || user?.user?.profileImage}
									icon={<UserOutlined />}
									style={{ marginBottom: '20px' }}
								/>
								{fileList.length === 0 && (
									<Button icon={<UploadOutlined />} block>
										Change Photo
									</Button>
								)}
							</Upload>
						</Col>
						<Col xs={24} sm={16}>
							<Card style={cardStyle} bordered={false}>
								<Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
									<Input />
								</Form.Item>
								<Form.Item name="phone" label="Phone">
									<Input />
								</Form.Item>
								<Form.Item name="address" label="Address">
									<Input.TextArea rows={3} />
								</Form.Item>
								<Row gutter={8}>
									<Col>
										<Button type="primary" htmlType="submit">
											Save Changes
										</Button>
									</Col>
									<Col>
										<Button onClick={() => setEditMode(false)}>Cancel</Button>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>
				</Form>
			)}

			{/* Password Update Modal */}
			<Modal
				title="Change Password"
				open={passwordModalVisible}
				onCancel={() => {
					setPasswordModalVisible(false);
					passwordForm.resetFields();
				}}
				footer={null}
			>
				<Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
					<Form.Item
						name="currentPassword"
						label="Current Password"
						rules={[{ required: true, message: 'Please enter your current password' }]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						name="newPassword"
						label="New Password"
						rules={[
							{ required: true, message: 'Please enter your new password' },
							{ min: 6, message: 'Password must be at least 6 characters' },
						]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						name="confirmPassword"
						label="Confirm New Password"
						dependencies={['newPassword']}
						rules={[
							{ required: true, message: 'Please confirm your new password' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('newPassword') === value) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('The two passwords do not match'));
								},
							}),
						]}
					>
						<Input.Password />
					</Form.Item>
					<Row gutter={8} justify="end">
						<Col>
							<Button
								onClick={() => {
									setPasswordModalVisible(false);
									passwordForm.resetFields();
								}}
							>
								Cancel
							</Button>
						</Col>
						<Col>
							<Button type="primary" htmlType="submit">
								Update Password
							</Button>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	));

	const PropertiesTab = React.memo(() => (
		<div
			style={{
				padding: screens.xs ? '0 12px' : '20px 0',
				paddingBottom: screens.xs ? '60px' : '20px', // Extra padding for bottom tab bar
				height: 'calc(100vh - 250px)',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{user?.properties?.length > 0 ? (
				<div style={{ overflowY: 'auto', flex: 1 }}>
					<List
						grid={{
							gutter: 16,
							xs: 1,
							sm: 2,
							md: 2,
							lg: 2,
							xl: 3,
						}}
						dataSource={user.properties}
						renderItem={(property) => (
							<List.Item>
								<Card
									hoverable
									style={{ ...cardStyle, height: '100%' }}
									cover={
										<div style={{ position: 'relative' }}>
											<img
												alt={property.name}
												src={property.imageUrls?.[0] || 'placeholder.jpg'}
												style={{ height: 200, objectFit: 'cover' }}
											/>
										</div>
									}
									actions={[
										<Button type="link" onClick={() => navigate(`/properties/${property._id}`)} icon={<HomeOutlined />}>
											View
										</Button>,
										<Button
											type="link"
											onClick={() => navigate(`/edit-property/${property._id}`)}
											icon={<EditOutlined />}
										>
											Edit
										</Button>,
									]}
								>
									<Card.Meta
										title={
											<div
												style={{
													marginBottom: '8px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
												}}
											>
												<span>{property.name}</span>
												<Tag
													color={property.verified ? 'success' : 'warning'}
													style={{
														fontSize: '12px',
														marginLeft: '8px',
													}}
												>
													{property.verified ? 'Approved' : 'Pending'}
												</Tag>
											</div>
										}
										description={
											<div>
												<p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
													{property.address?.houseNumber}
													{property.address?.block && `, Block ${property.address?.block}`}
													{property.address?.street && `, Street ${property.address?.street}`}
												</p>
												<p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
													{property.address?.societyTown && `${property.address.societyTown}, `}
													{property.address?.city}
												</p>
												<p style={{ margin: '4px 0', color: '#8c8c8c', fontSize: '12px' }}>
													Added: {new Date(property.createdAt).toLocaleDateString()}
												</p>
											</div>
										}
									/>
								</Card>
							</List.Item>
						)}
					/>
				</div>
			) : (
				<Card style={cardStyle}>
					<Empty description="No properties found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
						<Button type="primary" onClick={() => navigate('/add-property')}>
							Add Property
						</Button>
					</Empty>
				</Card>
			)}
		</div>
	));

	const ReviewsTab = React.memo(() => (
		<div
			style={{
				padding: '20px 0',
				height: 'calc(100vh - 250px)',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div style={{ overflowY: 'auto', flex: 1 }}>
				<List
					itemLayout="vertical"
					dataSource={user?.reviews || []}
					renderItem={(review) => (
						<List.Item key={review._id} style={{ padding: '16px' }}>
							<List.Item.Meta
								title={
									<div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
										<div>
											<h3 style={{ margin: 0 }}>Property Name</h3>
											<a href={`/properties/${review.property._id}`}>{review.property.name}</a>
										</div>
										<Tag
											color={review.reported ? 'error' : review.status === 'approved' ? 'success' : 'warning'}
											style={{
												fontSize: '12px',
												padding: '2px 8px',
											}}
										>
											{review.reported ? 'Reported' : review.status === 'approved' ? 'Approved' : 'Pending'}
										</Tag>
									</div>
								}
								description={
									<div>
										<h4 style={{ marginTop: 8, marginBottom: 4 }}>Address</h4>
										<p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
											{review.property.address?.houseNumber}
											{review.property.address?.block && `, Block ${review.property.address?.block}`}
											{review.property.address?.street && `, ${review.property.address?.street}`}
										</p>
										<p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
											{review.property.address?.societyTown && `${review.property.address.societyTown}, `}
											{review.property.address?.city}
											{review.property.address?.state && `, ${review.property.address.state}`}
										</p>
									</div>
								}
							/>
							<div>
								<h4 style={{ marginTop: 16, marginBottom: 8 }}>Review Comment</h4>
								<p>{review.comment}</p>
								<div style={{ marginTop: 12 }}>
									<h4 style={{ marginBottom: 8 }}>Ratings</h4>
									<Row gutter={[16, 8]}>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Cleanliness:</span>
												<Rate disabled defaultValue={review.ratings.cleanliness} allowHalf style={{ fontSize: 16 }} />
											</div>
										</Col>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Communication:</span>
												<Rate disabled defaultValue={review.ratings.communication} allowHalf style={{ fontSize: 16 }} />
											</div>
										</Col>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Location:</span>
												<Rate disabled defaultValue={review.ratings.location} allowHalf style={{ fontSize: 16 }} />
											</div>
										</Col>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Value for Money:</span>
												<Rate disabled defaultValue={review.ratings.valueForMoney} allowHalf style={{ fontSize: 16 }} />
											</div>
										</Col>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Water & Plumbing:</span>
												<Rate disabled defaultValue={review.ratings.waterPlumbing} allowHalf style={{ fontSize: 16 }} />
											</div>
										</Col>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Electricity:</span>
												<Rate
													disabled
													defaultValue={review.ratings.electricityWiring}
													allowHalf
													style={{ fontSize: 16 }}
												/>
											</div>
										</Col>
										<Col xs={24} sm={12}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<span style={{ minWidth: '100px' }}>Ventilation:</span>
												<Rate disabled defaultValue={review.ratings.ventilation} allowHalf style={{ fontSize: 16 }} />
											</div>
										</Col>
									</Row>
									<div
										style={{
											marginTop: 12,
											padding: '12px',
											background: '#f5f5f5',
											borderRadius: '4px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<span style={{ fontWeight: 'bold' }}>Overall Rating:</span>
										<Rate disabled defaultValue={review.overallRating} allowHalf style={{ fontSize: 20 }} />
									</div>
								</div>
								{review.media && review.media.length > 0 && (
									<div style={{ marginTop: 16 }}>
										<h4 style={{ marginBottom: 8 }}>Review Images</h4>
										<Row gutter={[8, 8]}>
											{review.media.map((url, index) => (
												<Col key={index} xs={12} sm={8} md={6}>
													<img
														src={url}
														alt={`Review media ${index + 1}`}
														style={{
															width: '100%',
															height: '100px',
															objectFit: 'cover',
															borderRadius: '4px',
														}}
													/>
												</Col>
											))}
										</Row>
									</div>
								)}
							</div>
						</List.Item>
					)}
				/>
			</div>
		</div>
	));

	const tabItems = [
		{
			key: 'profile',
			label: (
				<span>
					<UserOutlined style={{ marginRight: 8 }} />
					Profile
				</span>
			),
			children: <ProfileInfo />,
		},
		{
			key: 'properties',
			label: (
				<span>
					<HomeOutlined style={{ marginRight: 8 }} />
					Properties ({user?.properties?.length || 0})
				</span>
			),
			children: <PropertiesTab />,
		},
		{
			key: 'reviews',
			label: (
				<span>
					<StarOutlined style={{ marginRight: 8 }} />
					Reviews ({user?.reviews?.length || 0})
				</span>
			),
			children: <ReviewsTab />,
		},
	];

	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div
			style={{
				maxWidth: '1200px',
				margin: '0 auto',
				padding: screens.xs ? '8px' : '20px',
				minHeight: '100vh',
				background: isDarkMode ? '#141414' : '#f0f2f5',
			}}
		>
			<Card
				style={{
					...cardStyle,
					margin: '0 auto',
					borderRadius: '8px',
					boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
				}}
				styles={{
					body: {
						padding: screens.xs ? '12px 0' : '24px',
					},
				}}
			>
				<Tabs
					activeKey={activeTab}
					onChange={handleTabChange}
					items={tabItems}
					tabPosition="top"
					centered
					size="middle"
					tabBarGutter={24}
					tabBarStyle={{
						marginBottom: '16px',
					}}
				/>
			</Card>
		</div>
	);
};

export default Profile;
