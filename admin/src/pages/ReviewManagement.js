import { useEffect, useState } from 'react';
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	message,
	DatePicker,
	Tag,
	Image,
	Rate,
	Avatar,
	Tooltip,
	Row,
	Col,
	Card,
	Empty,
	Radio,
	Space,
	Pagination,
} from 'antd';
import { fetchReviews, addReview, deleteReview, approveReview, flagReview } from '../services/reviewService';
import { fetchProperties } from '../services/propertyService';
import { fetchUsers } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { CheckOutlined, FlagOutlined, DeleteOutlined } from '@ant-design/icons';
import IconAction from '../components/IconAction';
import UserAvatar from '../components/UserAvatar';
import useServerSort from '../hooks/useServerSort';

const { Option } = Select;
const { TextArea } = Input;

const ReviewManagement = () => {
	const [users, setUsers] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [properties, setProperties] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [statusFilter, setStatusFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 20,
		total: 0,
	});
	const { userID } = useAuth();
	const { sort, sortable, handleSorter } = useServerSort();

	const loadReviews = async (params = {}) => {
		setLoading(true);
		try {
			const { page = pagination.current, limit = pagination.pageSize } = params;

			// Build filter parameters
			const filterParams = {
				...params,
				page,
				limit,
				...sort,
			};

			// Add status filter if not 'all'
			if (statusFilter !== 'all') {
				filterParams.status = statusFilter;
			}

			// Add search query if exists
			if (searchQuery) {
				filterParams.query = searchQuery;
			}

			console.log('Fetching reviews with params:', filterParams);

			const data = await fetchReviews(filterParams);
			setReviews(data.reviews);
			setPagination({
				...pagination,
				current: data.page,
				total: data.total,
				pageSize: data.limit,
			});
		} catch (err) {
			console.error('Error fetching reviews:', err);
			message.error('Failed to fetch reviews');
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			const data = await fetchUsers();
			setUsers(data.users);
		} catch (err) {
			message.error('Failed to fetch users');
		}
	};

	const loadProperties = async () => {
		try {
			const data = await fetchProperties();
			setProperties(data.properties);
		} catch (err) {
			message.error('Failed to fetch properties');
		}
	};

	const onSubmit = async (values) => {
		try {
			await addReview({
				...values,
				moveInDate: values.moveInDate.format('YYYY-MM-DD'),
				moveOutDate: values.moveOutDate.format('YYYY-MM-DD'),
				reviewer: userID,
			});
			message.success('Review added successfully!');
			setIsModalOpen(false);
			form.resetFields();
			loadReviews();
		} catch (err) {
			message.error('Failed to add review');
		}
	};

	const handleDelete = async (reviewId) => {
		try {
			await deleteReview(reviewId);
			message.success('Review deleted successfully!');
			loadReviews();
		} catch (err) {
			message.error('Failed to delete review');
		}
	};

	const handleTableChange = (paginationParams) => {
		loadReviews({
			page: paginationParams.current,
			limit: paginationParams.pageSize,
		});
	};

	useEffect(() => {
		loadReviews();
		loadProperties();
		loadUsers();
	}, []);

	useEffect(() => {
		loadReviews({ page: 1 });
	}, [statusFilter, searchQuery, sort]);

	const handleApprove = async (reviewId) => {
		try {
			await approveReview(reviewId);
			message.success('Review approved successfully');
			loadReviews();
		} catch (error) {
			message.error(error.message);
		}
	};

	const handleFlag = async (reviewId) => {
		try {
			await flagReview(reviewId);
			message.success('Review flagged successfully');
			loadReviews();
		} catch (error) {
			message.error(error.message);
		}
	};

	const handleSearch = (value) => {
		setSearchQuery(value);
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const handleStatusFilterChange = (e) => {
		const value = e.target.value;
		setStatusFilter(value);
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const columns = [
		{
			title: 'S.No',
			key: 'serialNumber',
			render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
			width: 80,
		},
		{
			title: 'ID',
			dataIndex: '_id',
			key: '_id',
			width: 220,
		},
		{
			title: 'Property',
			dataIndex: ['property', 'name'],
			render: (text) => text || 'Unknown',
		},
		{
			title: 'Reviewer',
			dataIndex: ['reviewer', 'name'],
			render: (text, record) => (
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<UserAvatar name={text || 'Anonymous'} src={record.reviewer?.profileImage} />
					<span>{text || 'Anonymous'}</span>
				</div>
			),
		},
		{
			title: 'Rating',
			dataIndex: 'overallRating',
			...sortable('overallRating'),
			render: (rating) => (
				<span>
					<Rate disabled defaultValue={rating} style={{ fontSize: '14px' }} />
					<span style={{ marginLeft: '8px' }}>{rating}/5</span>
				</span>
			),
		},
		{
			title: 'Stay Duration',
			dataIndex: 'stayDuration',
			...sortable('stayDuration'),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			...sortable('status'),
			render: (status) => {
				const colors = { approved: 'green', flagged: 'orange', pending: 'red' };
				return <Tag color={colors[status]}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</Tag>;
			},
		},
		{
			title: 'Action',
			width: 110,
			render: (_, record) => (
				<div className="pp-actions" onClick={(e) => e.stopPropagation()}>
					{record.status !== 'approved' ? (
						<IconAction
							icon={<CheckOutlined />}
							label="Approve"
							tone="approve"
							confirm="Approve this review?"
							onConfirm={() => handleApprove(record._id)}
						/>
					) : (
						<IconAction
							icon={<FlagOutlined />}
							label={record.status === 'flagged' ? 'Already flagged' : 'Flag'}
							tone="warn"
							confirm="Flag this review?"
							disabled={record.status === 'flagged'}
							onConfirm={() => handleFlag(record._id)}
						/>
					)}
					<IconAction
						icon={<DeleteOutlined />}
						label="Delete"
						tone="danger"
						confirm="Delete this review?"
						confirmDescription="This can't be undone."
						okText="Delete"
						onConfirm={() => handleDelete(record._id)}
					/>
				</div>
			),
		},
	];

	return (
		<div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
			{/* Header Section */}
			<div
				style={{
					padding: '16px 24px',
					backgroundColor: '#fff',
					borderBottom: '1px solid #f0f0f0',
					flex: '0 0 auto',
				}}
			>
				<Row gutter={[16, 16]} align="middle">
					<Col flex="auto">
						<Space size="large">
							<Radio.Group
								value={statusFilter}
								onChange={handleStatusFilterChange}
								optionType="button"
								buttonStyle="solid"
							>
								<Radio.Button value="all">All Reviews</Radio.Button>
								<Radio.Button value="approved">
									<Tag color="green">Approved</Tag>
								</Radio.Button>
								<Radio.Button value="pending">
									<Tag color="red">Pending</Tag>
								</Radio.Button>
								<Radio.Button value="flagged">
									<Tag color="orange">Flagged</Tag>
								</Radio.Button>
							</Radio.Group>
							<Input.Search
								placeholder="Search reviews..."
								allowClear
								onSearch={handleSearch}
								style={{ width: '300px' }}
							/>
						</Space>
					</Col>
					<Col>
						<Button type="primary" onClick={() => setIsModalOpen(true)}>
							Add Review
						</Button>
					</Col>
				</Row>
			</div>

			{/* Table Section */}
			<div
				style={{
					flex: '1 1 auto',
					overflowY: 'auto',
					padding: '0 24px',
				}}
			>
				<Table
					dataSource={reviews}
					loading={loading}
					rowKey="_id"
					pagination={false}
					onChange={(_, __, sorter) => handleSorter(sorter)}
					showSorterTooltip={false}
					columns={columns}
					expandable={{
						expandedRowRender: (record) => (
							<Card size="small">
								<Row gutter={[16, 16]}>
									<Col span={8}>
										<Card size="small" title="Property Details">
											{record.property?.imageUrls?.length > 0 && (
												<Image.PreviewGroup>
													<Image
														src={record.property.imageUrls[0]}
														alt={record.property.name}
														style={{ width: '100%', height: 200, objectFit: 'cover', marginBottom: 16 }}
													/>
												</Image.PreviewGroup>
											)}
											<p>
												<strong>Owner:</strong> {record.property?.owner}
											</p>
											<p>
												<strong>Description:</strong> {record.property?.description}
											</p>
										</Card>
									</Col>
									<Col span={8}>
										<Card size="small" title="Review Details">
											<div style={{ marginBottom: 16 }}>
												<div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
													<Avatar size={64} src={record.reviewer?.profileImage} />
													<div style={{ marginLeft: 16 }}>
														<div>
															<strong>{record.reviewer?.name}</strong>
														</div>
														<div>{record.reviewer?.email}</div>
													</div>
												</div>
												<p>
													<strong>Comment:</strong> {record.comment}
												</p>
												<div>
													<strong>Stay Period:</strong>
													<div>From: {new Date(record.moveInDate).toLocaleDateString()}</div>
													<div>To: {new Date(record.moveOutDate).toLocaleDateString()}</div>
												</div>
											</div>
											<div>
												<strong>Detailed Ratings:</strong>
												<div>
													Cleanliness: <Rate disabled defaultValue={record.ratings?.cleanliness} />
												</div>
												<div>
													Communication: <Rate disabled defaultValue={record.ratings?.communication} />
												</div>
												<div>
													Location: <Rate disabled defaultValue={record.ratings?.location} />
												</div>
												<div>
													Value for Money: <Rate disabled defaultValue={record.ratings?.valueForMoney} />
												</div>
											</div>
										</Card>
									</Col>
									<Col span={8}>
										<Card size="small" title="Review Media">
											{record.media?.length > 0 ? (
												<Image.PreviewGroup>
													<Row gutter={[8, 8]}>
														{record.media.map((url, index) => (
															<Col span={8} key={index}>
																<Image src={url} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
															</Col>
														))}
													</Row>
												</Image.PreviewGroup>
											) : (
												<Empty description="No media available" />
											)}
										</Card>
									</Col>
								</Row>
							</Card>
						),
					}}
				/>
			</div>

			{/* Pagination Section */}
			<div
				style={{
					padding: '16px 24px',
					backgroundColor: '#fff',
					borderTop: '1px solid #f0f0f0',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flex: '0 0 auto',
				}}
			>
				<Pagination
					current={pagination.current}
					pageSize={pagination.pageSize}
					total={pagination.total}
					showSizeChanger
					pageSizeOptions={['20', '30', '50']}
					showTotal={(total) => `Total ${total} reviews`}
					onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })}
				/>
			</div>

			<Modal title="Add Review" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
				<Form form={form} onFinish={onSubmit} layout="vertical">
					<Form.Item name="property" label="Property" rules={[{ required: true, message: 'Property is required' }]}>
						<Select placeholder="Select Property">
							{properties.length &&
								properties?.map((prop) => (
									<Option key={prop._id} value={prop._id}>
										{prop.name}
									</Option>
								))}
						</Select>
					</Form.Item>
					<Form.Item name="reviewer" label="Reviewer" rules={[{ required: true, message: 'Reviewer is required' }]}>
						<Select placeholder="Select Reviewer">
							{users.map((user) => (
								<Option key={user._id} value={user._id}>
									{user.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						name="overallRating"
						label="Overall Rating"
						rules={[{ required: true, message: 'Overall Rating is required' }]}
					>
						<Input type="number" min={1} max={5} placeholder="Rating (1-5)" />
					</Form.Item>

					<Form.Item label="Ratings">
						<Input.Group compact>
							<Form.Item
								name={['ratings', 'cleanliness']}
								noStyle
								rules={[{ required: true, message: 'Cleanliness rating is required' }]}
							>
								<Input type="number" min={1} max={5} placeholder="Cleanliness (1-5)" style={{ width: '20%' }} />
							</Form.Item>
							<Form.Item
								name={['ratings', 'communication']}
								noStyle
								rules={[
									{
										required: true,
										message: 'Communication rating is required',
									},
								]}
							>
								<Input type="number" min={1} max={5} placeholder="Communication (1-5)" style={{ width: '20%' }} />
							</Form.Item>
							<Form.Item
								name={['ratings', 'location']}
								noStyle
								rules={[{ required: true, message: 'Location rating is required' }]}
							>
								<Input type="number" min={1} max={5} placeholder="Location (1-5)" style={{ width: '20%' }} />
							</Form.Item>
							<Form.Item
								name={['ratings', 'valueForMoney']}
								noStyle
								rules={[
									{
										required: true,
										message: 'Value for Money rating is required',
									},
								]}
							>
								<Input type="number" min={1} max={5} placeholder="Value (1-5)" style={{ width: '20%' }} />
							</Form.Item>
						</Input.Group>
					</Form.Item>

					<Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Comment is required' }]}>
						<TextArea placeholder="Write a comment" rows={4} />
					</Form.Item>

					<Form.Item
						name="stayDuration"
						label="Stay Duration"
						rules={[{ required: true, message: 'Stay Duration is required' }]}
					>
						<Input placeholder="Stay Duration (e.g., 3 months)" />
					</Form.Item>

					<Form.Item
						name="moveInDate"
						label="Move-In Date"
						rules={[{ required: true, message: 'Move-In Date is required' }]}
					>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						name="moveOutDate"
						label="Move-Out Date"
						rules={[{ required: true, message: 'Move-Out Date is required' }]}
					>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ReviewManagement;
