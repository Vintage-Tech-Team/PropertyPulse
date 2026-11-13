import React, { useState, useEffect, useMemo } from 'react';
import { Spin, message, Button, Avatar, Upload, Form, Input, Modal, Empty, Image } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getUserProfile } from '../../services/authService';
import { updateUserProfile, updateUserPassword } from '../../services/userService';
import { EditOutlined, UserOutlined, CameraOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './Profile.module.css';

const RATING_CATEGORIES = [
	{ key: 'cleanliness', label: 'Cleanliness' },
	{ key: 'communication', label: 'Communication' },
	{ key: 'location', label: 'Location' },
	{ key: 'valueForMoney', label: 'Value for money' },
	{ key: 'waterPlumbing', label: 'Water & plumbing' },
	{ key: 'electricityWiring', label: 'Electricity & wiring' },
	{ key: 'ventilation', label: 'Ventilation' },
];

const TABS = [
	{ key: 'profile', label: 'Overview' },
	{ key: 'properties', label: 'Properties' },
	{ key: 'reviews', label: 'Reviews' },
];

const FALLBACK_IMAGE =
	'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) =>
	value ? new Date(value).toLocaleDateString(undefined, options) : '—';

const formatAddress = (address) => {
	if (!address) return '';
	const line1 = [
		address.houseNumber,
		address.block && `Block ${address.block}`,
		address.street && `Street ${address.street}`,
	]
		.filter(Boolean)
		.join(', ');
	const line2 = [address.societyTown, address.city].filter(Boolean).join(', ');
	return [line1, line2].filter(Boolean).join(' · ');
};

const StarIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="currentColor"
			d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-2.9-5.6 2.9 1-6.2L2.9 9.4l6.3-.9L12 2.8Z"
		/>
	</svg>
);

const statusOf = (review) => {
	if (review.reported) return { label: 'Reported', tone: 'danger' };
	if (review.status === 'approved') return { label: 'Published', tone: 'success' };
	return { label: 'Pending', tone: 'warning' };
};

const Profile = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('profile');
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editMode, setEditMode] = useState(false);
	const [saving, setSaving] = useState(false);
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [updatingPassword, setUpdatingPassword] = useState(false);
	const [form] = Form.useForm();
	const [passwordForm] = Form.useForm();
	const [fileList, setFileList] = useState([]);
	const [previewUrl, setPreviewUrl] = useState(null);

	useEffect(() => {
		loadUserProfile();
	}, []);

	useEffect(() => {
		const tabFromUrl = new URLSearchParams(location.search).get('tab');
		if (tabFromUrl && TABS.some((tab) => tab.key === tabFromUrl)) {
			setActiveTab(tabFromUrl);
		}
	}, [location.search]);

	const loadUserProfile = async () => {
		try {
			const profile = await getUserProfile();
			setData(profile);
		} catch (err) {
			message.error('Failed to load your profile');
		} finally {
			setLoading(false);
		}
	};

	const user = data?.user;
	const properties = data?.properties || [];
	const reviews = data?.reviews || [];

	const averageGiven = useMemo(() => {
		const rated = (data?.reviews || []).filter((review) => review.overallRating > 0);
		if (!rated.length) return null;
		return rated.reduce((sum, review) => sum + review.overallRating, 0) / rated.length;
	}, [data]);

	const startEditing = () => {
		form.setFieldsValue({ name: user?.name, phone: user?.phone, address: user?.address });
		setEditMode(true);
		setActiveTab('profile');
	};

	const cancelEditing = () => {
		setEditMode(false);
		setFileList([]);
		setPreviewUrl(null);
	};

	const handleProfileUpdate = async (values) => {
		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('phone', values.phone || '');
			formData.append('address', values.address || '');
			if (fileList.length > 0) {
				formData.append('profileImage', fileList[0].originFileObj);
			}

			await updateUserProfile(formData);
			message.success('Profile updated');
			cancelEditing();
			loadUserProfile();
		} catch (error) {
			message.error(error.response?.data?.message || 'Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	const closePasswordModal = () => {
		setPasswordModalOpen(false);
		passwordForm.resetFields();
	};

	const handlePasswordUpdate = async (values) => {
		setUpdatingPassword(true);
		try {
			await updateUserPassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
			message.success('Password updated');
			closePasswordModal();
		} catch (error) {
			message.error(error.response?.data?.message || 'Failed to update password');
		} finally {
			setUpdatingPassword(false);
		}
	};

	const handleFileChange = ({ fileList: newFileList }) => {
		const latest = newFileList.slice(-1);
		setFileList(latest);
		if (latest.length > 0) {
			const reader = new FileReader();
			reader.onload = (e) => setPreviewUrl(e.target.result);
			reader.readAsDataURL(latest[0].originFileObj);
		} else {
			setPreviewUrl(null);
		}
	};

	const handleTabChange = (key) => {
		setActiveTab(key);
		navigate(`/profile?tab=${key}`, { replace: true });
	};

	if (loading) {
		return (
			<div className={styles.loading}>
				<Spin size="large" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className={styles.page}>
				<Empty description="We couldn't load your profile" />
			</div>
		);
	}

	const counts = { properties: properties.length, reviews: reviews.length };

	const renderOverview = () =>
		editMode ? (
			<section className={styles.card}>
				<div className={styles.cardHeader}>
					<div>
						<h2 className={styles.cardTitle}>Edit profile</h2>
						<p className={styles.cardSubtitle}>Update your name, contact details and photo.</p>
					</div>
				</div>

				<Form form={form} layout="vertical" onFinish={handleProfileUpdate} requiredMark={false}>
					<div className={styles.photoRow}>
						<Avatar
							size={72}
							src={previewUrl || user.profileImage}
							icon={<UserOutlined />}
							className={styles.photoAvatar}
						/>
						<div>
							<Upload
								accept="image/*"
								fileList={fileList}
								onChange={handleFileChange}
								beforeUpload={() => false}
								showUploadList={false}
								maxCount={1}
							>
								<Button icon={<CameraOutlined />}>{previewUrl ? 'Choose another photo' : 'Change photo'}</Button>
							</Upload>
							<p className={styles.hint}>
								{fileList[0] ? fileList[0].name : 'JPG or PNG, a square photo works best.'}
							</p>
						</div>
					</div>

					<div className={styles.formGrid}>
						<Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Name is required' }]}>
							<Input size="large" />
						</Form.Item>
						<Form.Item name="phone" label="Phone">
							<Input size="large" placeholder="03xx xxxxxxx" />
						</Form.Item>
						<Form.Item name="address" label="Address" className={styles.fullWidth}>
							<Input.TextArea rows={3} placeholder="House, street, area, city" />
						</Form.Item>
					</div>

					<div className={styles.formActions}>
						<Button size="large" onClick={cancelEditing}>
							Cancel
						</Button>
						<Button size="large" type="primary" htmlType="submit" loading={saving}>
							Save changes
						</Button>
					</div>
				</Form>
			</section>
		) : (
			<div className={styles.overviewGrid}>
				<section className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h2 className={styles.cardTitle}>Personal details</h2>
							<p className={styles.cardSubtitle}>Only you can see your phone number and address.</p>
						</div>
						<Button icon={<EditOutlined />} onClick={startEditing}>
							Edit
						</Button>
					</div>
					<dl className={styles.details}>
						<div>
							<dt>Full name</dt>
							<dd>{user.name}</dd>
						</div>
						<div>
							<dt>Email</dt>
							<dd>{user.email}</dd>
						</div>
						<div>
							<dt>Phone</dt>
							<dd className={!user.phone ? styles.missing : undefined}>{user.phone || 'Not added yet'}</dd>
						</div>
						<div>
							<dt>Address</dt>
							<dd className={!user.address ? styles.missing : undefined}>{user.address || 'Not added yet'}</dd>
						</div>
						<div>
							<dt>Member since</dt>
							<dd>{formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</dd>
						</div>
					</dl>
				</section>

				<section className={styles.card}>
					<div className={styles.cardHeader}>
						<div>
							<h2 className={styles.cardTitle}>Security</h2>
							<p className={styles.cardSubtitle}>Keep your account safe.</p>
						</div>
					</div>
					<div className={styles.securityRow}>
						<span className={styles.securityIcon}>
							<LockOutlined />
						</span>
						<div className={styles.securityText}>
							<p className={styles.securityTitle}>Password</p>
							<p className={styles.hint}>Use at least 6 characters you don't use elsewhere.</p>
						</div>
					</div>
					<Button block size="large" onClick={() => setPasswordModalOpen(true)}>
						Change password
					</Button>
				</section>
			</div>
		);

	const renderProperties = () =>
		properties.length > 0 ? (
			<div className={styles.propertyGrid}>
				{properties.map((property) => (
					<article key={property._id} className={styles.propertyCard}>
						<Link to={`/properties/${property._id}`} className={styles.propertyImageLink}>
							<img
								src={property.imageUrls?.[0] || FALLBACK_IMAGE}
								alt={property.name}
								className={styles.propertyImage}
								onError={(e) => {
									e.currentTarget.onerror = null;
									e.currentTarget.src = FALLBACK_IMAGE;
								}}
							/>
							<span className={`${styles.badge} ${property.verified ? styles.success : styles.warning}`}>
								{property.verified ? 'Approved' : 'Pending review'}
							</span>
						</Link>
						<div className={styles.propertyBody}>
							<Link to={`/properties/${property._id}`} className={styles.propertyName}>
								{property.name}
							</Link>
							<p className={styles.propertyAddress}>{formatAddress(property.address) || 'Address not set'}</p>
							<p className={styles.hint}>Added {formatDate(property.createdAt)}</p>
						</div>
						<div className={styles.propertyActions}>
							<Button onClick={() => navigate(`/properties/${property._id}`)}>View</Button>
							<Button icon={<EditOutlined />} onClick={() => navigate(`/edit-property/${property._id}`)}>
								Edit
							</Button>
						</div>
					</article>
				))}
			</div>
		) : (
			<section className={`${styles.card} ${styles.emptyCard}`}>
				<p className={styles.emptyTitle}>You haven't listed a property yet</p>
				<p className={styles.hint}>Add a place you've lived in so others can learn from your experience.</p>
				<Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/add-property')}>
					Add a property
				</Button>
			</section>
		);

	const renderReviews = () =>
		reviews.length > 0 ? (
			<div className={styles.reviewList}>
				{reviews.map((review) => {
					const status = statusOf(review);
					const property = review.property;
					return (
						<article key={review._id} className={styles.reviewCard}>
							<div className={styles.reviewHeader}>
								{property ? (
									<Link to={`/properties/${property._id}`} className={styles.reviewProperty}>
										<img
											src={property.imageUrls?.[0] || FALLBACK_IMAGE}
											alt=""
											className={styles.reviewThumb}
											onError={(e) => {
												e.currentTarget.onerror = null;
												e.currentTarget.src = FALLBACK_IMAGE;
											}}
										/>
										<div className={styles.reviewPropertyText}>
											<span className={styles.reviewPropertyName}>{property.name}</span>
											<span className={styles.hint}>{formatAddress(property.address)}</span>
										</div>
									</Link>
								) : (
									<span className={styles.reviewPropertyName}>Property no longer available</span>
								)}
								<div className={styles.reviewMeta}>
									<span className={styles.overall}>
										<StarIcon />
										{Number(review.overallRating || 0).toFixed(1)}
									</span>
									<span className={`${styles.badge} ${styles[status.tone]}`}>{status.label}</span>
								</div>
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
								<div className={styles.reviewMedia}>
									<Image.PreviewGroup>
										{review.media.map((url, index) => (
											<Image
												key={url}
												src={url}
												alt={`Review photo ${index + 1}`}
												width={88}
												height={88}
												className={styles.mediaImage}
											/>
										))}
									</Image.PreviewGroup>
								</div>
							)}

							<p className={styles.reviewDate}>Posted {formatDate(review.createdAt)}</p>
						</article>
					);
				})}
			</div>
		) : (
			<section className={`${styles.card} ${styles.emptyCard}`}>
				<p className={styles.emptyTitle}>No reviews yet</p>
				<p className={styles.hint}>Rate a place you've lived in to help the next tenant decide.</p>
				<Button type="primary" size="large" onClick={() => navigate('/properties')}>
					Browse properties
				</Button>
			</section>
		);

	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<div className={styles.cover} />
				<div className={styles.heroBody}>
					<Avatar size={112} src={user.profileImage} icon={<UserOutlined />} className={styles.avatar} />
					<div className={styles.identity}>
						<p className={styles.eyebrow}>{user.role === 'admin' ? 'Administrator' : 'Member'}</p>
						<h1 className={styles.name}>{user.name}</h1>
						<p className={styles.email}>
							{user.email} · Joined {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}
						</p>
					</div>
					<div className={styles.heroActions}>
						<Button icon={<EditOutlined />} onClick={startEditing}>
							Edit profile
						</Button>
						<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add-property')}>
							Add property
						</Button>
					</div>
				</div>

				<div className={styles.stats}>
					<div className={styles.stat}>
						<span className={styles.statValue}>{properties.length}</span>
						<span className={styles.statLabel}>Properties listed</span>
					</div>
					<div className={styles.stat}>
						<span className={styles.statValue}>{reviews.length}</span>
						<span className={styles.statLabel}>Reviews written</span>
					</div>
					<div className={styles.stat}>
						<span className={styles.statValue}>{averageGiven ? averageGiven.toFixed(1) : '—'}</span>
						<span className={styles.statLabel}>Average rating given</span>
					</div>
				</div>
			</section>

			<nav className={styles.tabs} role="tablist" aria-label="Profile sections">
				{TABS.map((tab) => (
					<button
						key={tab.key}
						type="button"
						role="tab"
						aria-selected={activeTab === tab.key}
						className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
						onClick={() => handleTabChange(tab.key)}
					>
						{tab.label}
						{counts[tab.key] !== undefined && <span className={styles.tabCount}>{counts[tab.key]}</span>}
					</button>
				))}
			</nav>

			<div role="tabpanel">
				{activeTab === 'profile' && renderOverview()}
				{activeTab === 'properties' && renderProperties()}
				{activeTab === 'reviews' && renderReviews()}
			</div>

			<Modal title="Change password" open={passwordModalOpen} onCancel={closePasswordModal} footer={null} destroyOnHidden>
				<Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate} requiredMark={false}>
					<Form.Item
						name="currentPassword"
						label="Current password"
						rules={[{ required: true, message: 'Please enter your current password' }]}
					>
						<Input.Password size="large" autoComplete="current-password" />
					</Form.Item>
					<Form.Item
						name="newPassword"
						label="New password"
						rules={[
							{ required: true, message: 'Please enter a new password' },
							{ min: 6, message: 'Password must be at least 6 characters' },
						]}
					>
						<Input.Password size="large" autoComplete="new-password" />
					</Form.Item>
					<Form.Item
						name="confirmPassword"
						label="Confirm new password"
						dependencies={['newPassword']}
						rules={[
							{ required: true, message: 'Please confirm your new password' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
									return Promise.reject(new Error('The two passwords do not match'));
								},
							}),
						]}
					>
						<Input.Password size="large" autoComplete="new-password" />
					</Form.Item>
					<div className={styles.formActions}>
						<Button size="large" onClick={closePasswordModal}>
							Cancel
						</Button>
						<Button size="large" type="primary" htmlType="submit" loading={updatingPassword}>
							Update password
						</Button>
					</div>
				</Form>
			</Modal>
		</div>
	);
};

export default Profile;
