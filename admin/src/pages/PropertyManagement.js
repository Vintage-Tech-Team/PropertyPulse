import React, { useEffect, useState } from 'react';
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	message,
	Popconfirm,
	Tag,
	Row,
	Col,
	DatePicker,
	Radio,
	Space,
	Pagination,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, addProperty, deleteProperty, updateProperty } from '../services/propertyService';
import { fetchAddresses } from '../services/addressService';
import { debounce } from 'lodash';
import AdComponent from '../components/AdComponent';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Input;
const { RangePicker } = DatePicker;

const PropertyManagement = () => {
	const [properties, setProperties] = useState([]);
	const [addresses, setAddresses] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [verificationFilter, setVerificationFilter] = useState('all');
	const [dateRange, setDateRange] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 20,
		total: 0,
	});
	const navigate = useNavigate();
	const { userID } = useAuth();

	// Effect to load properties when filters change
	useEffect(() => {
		console.log('Filter changed - Current filter:', verificationFilter);
		loadProperties();
	}, [verificationFilter, dateRange, searchQuery, pagination.current, pagination.pageSize]);

	const loadProperties = async () => {
		setLoading(true);
		try {
			// Build filter parameters
			const filterParams = {
				page: pagination.current,
				limit: pagination.pageSize,
				isAdmin: true,
				sortBy: 'createdAt',
				sortOrder: 'desc',
			};

			// Add verification filter if not 'all'
			if (verificationFilter !== 'all') {
				filterParams.verified = verificationFilter === 'verified';
			}

			// Add date range if selected
			if (dateRange) {
				filterParams.startDate = dateRange[0].toISOString();
				filterParams.endDate = dateRange[1].toISOString();
			}

			// Add search query if exists
			if (searchQuery) {
				filterParams.query = searchQuery;
			}

			console.log('Fetching properties with params:', filterParams);

			const data = await fetchProperties(filterParams);
			console.log('Received properties:', data.properties);

			setProperties(data.properties);
			setPagination((prev) => ({
				...prev,
				total: data.total,
			}));
		} catch (err) {
			console.error('Error fetching properties:', err);
			message.error('Failed to fetch properties');
		} finally {
			setLoading(false);
		}
	};

	const loadAddresses = async () => {
		try {
			const data = await fetchAddresses();
			setAddresses(data.addresses);
		} catch (err) {
			message.error('Failed to fetch addresses');
		}
	};

	const onSubmit = async (values) => {
		try {
			await addProperty({
				...values,
				createdBy: userID,
			});
			message.success('Property added successfully!');
			setIsModalOpen(false);
			loadProperties();
		} catch (err) {
			message.error('Failed to add property');
		}
	};

	const handleDelete = async (propertyId) => {
		try {
			await deleteProperty(propertyId);
			message.success('Property deleted successfully!');
			loadProperties();
		} catch (err) {
			message.error('Failed to delete property');
		}
	};

	const handleApprove = async (propertyId) => {
		try {
			const property = properties.find((p) => p._id === propertyId);
			await updateProperty(propertyId, {
				...property,
				verified: true,
			});
			message.success('Property approved successfully!');
			loadProperties();
		} catch (err) {
			message.error('Failed to approve property');
		}
	};

	const handleUnapprove = async (propertyId) => {
		try {
			const property = properties.find((p) => p._id === propertyId);
			await updateProperty(propertyId, {
				...property,
				verified: false,
			});
			message.success('Property unapproved successfully!');
			loadProperties();
		} catch (err) {
			message.error('Failed to unapprove property');
		}
	};

	const handleVerificationFilterChange = (e) => {
		const value = e.target.value;
		console.log('Setting verification filter to:', value);
		setVerificationFilter(value);
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const handleDateRangeChange = (dates) => {
		console.log('Setting date range to:', dates);
		setDateRange(dates);
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const handleSearch = (value) => {
		console.log('Setting search query to:', value);
		setSearchQuery(value);
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

	const handleTableChange = (newPagination) => {
		console.log('Changing pagination to:', newPagination);
		setPagination((prev) => ({
			...prev,
			current: newPagination.current,
			pageSize: newPagination.pageSize,
		}));
	};

	useEffect(() => {
		loadProperties();
		loadAddresses();
	}, []);

	return (
		<div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
			{/* Search and Filters */}
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
						<Input.Search
							placeholder="Search properties..."
							allowClear
							onSearch={handleSearch}
							style={{ width: '100%' }}
						/>
					</Col>
					<Col>
						<Space size="large">
							<Radio.Group
								value={verificationFilter}
								onChange={handleVerificationFilterChange}
								optionType="button"
								buttonStyle="solid"
							>
								<Radio.Button value="all">All Properties</Radio.Button>
								<Radio.Button value="verified">
									<Tag color="green">Verified</Tag>
								</Radio.Button>
								<Radio.Button value="unverified">
									<Tag color="red">Unverified</Tag>
								</Radio.Button>
							</Radio.Group>
							<RangePicker onChange={handleDateRangeChange} value={dateRange} />
							<Button type="primary" onClick={() => setIsModalOpen(true)}>
								Add Property
							</Button>
						</Space>
					</Col>
				</Row>
			</div>

			{/* Table Content */}
			<div
				style={{
					flex: '1 1 auto',
					overflowY: 'auto',
					padding: '0 24px',
				}}
			>
				{/* Scrollable Table Content */}
				<Table
					loading={loading}
					dataSource={properties}
					rowKey="_id"
					pagination={false}
					onRow={(record) => ({
						onClick: () => navigate(`/dashboard/properties/${record._id}`),
						style: { cursor: 'pointer' },
					})}
					columns={[
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
							title: 'Name',
							dataIndex: 'name',
							key: 'name',
						},
						{
							title: 'Owner',
							dataIndex: 'owner',
							key: 'owner',
						},
						{
							title: 'Consumer ID',
							dataIndex: 'consumerId',
							key: 'consumerId',
							render: (consumerId) => consumerId || 'N/A',
						},
						{
							title: 'Address',
							key: 'address',
							width: 300,
							render: (_, record) => (
								<span>
									{[
										record.address?.houseNumber,
										record.address?.street,
										record.address?.block,
										record.address?.societyTown,
										record.address?.city,
									]
										.filter(Boolean)
										.join(', ')}
								</span>
							),
						},
						{
							title: 'Status',
							dataIndex: 'verified',
							key: 'verified',
							render: (verified) => (
								<Tag color={verified ? 'green' : 'red'}>{verified ? 'Verified' : 'Unverified'}</Tag>
							),
						},
						{
							title: 'Created At',
							dataIndex: 'createdAt',
							key: 'createdAt',
							render: (date) => new Date(date).toLocaleDateString(),
						},
						{
							title: 'Action',
							key: 'action',
							render: (_, record) => (
								<div onClick={(e) => e.stopPropagation()}>
									<Popconfirm
										title="Are you sure you want to delete this property?"
										onConfirm={() => handleDelete(record._id)}
										okText="Yes"
										cancelText="No"
									>
										<Button danger style={{ marginRight: '8px' }}>
											Delete
										</Button>
									</Popconfirm>
									<Popconfirm
										title={
											record.verified
												? 'Are you sure you want to unapprove this property?'
												: 'Are you sure you want to approve this property?'
										}
										onConfirm={() => {
											record.verified ? handleUnapprove(record._id) : handleApprove(record._id);
										}}
										okText="Yes"
										cancelText="No"
									>
										<Button type="primary">{record.verified ? 'Unapprove' : 'Approve'}</Button>
									</Popconfirm>
								</div>
							),
						},
					]}
				/>
			</div>

			{/* Pagination */}
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
					{...pagination}
					showSizeChanger
					pageSizeOptions={['20', '30', '50']}
					showTotal={(total) => `Total ${total} properties`}
					onChange={(page, pageSize) => {
						console.log('Pagination changed:', { page, pageSize });
						handleTableChange({ current: page, pageSize });
					}}
				/>
			</div>

			{/* Modal */}
			<Modal title="Add Property" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
				<Form form={form} onFinish={onSubmit}>
					<Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
						<Input placeholder="Property Name" />
					</Form.Item>
					<Form.Item name="owner" rules={[{ required: true, message: 'Owner is required' }]}>
						<Input placeholder="Owner Name" />
					</Form.Item>
					<Form.Item name="address" rules={[{ required: true, message: 'Address is required' }]}>
						<Input.Select placeholder="Select Address">
							{addresses &&
								addresses?.length &&
								addresses?.map((addr) => (
									<Option key={addr._id} value={addr._id}>
										{addr.street}, {addr.houseNumber}, {addr.block}, {addr.societyTown} {addr.city}, {addr.state}
									</Option>
								))}
						</Input.Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default PropertyManagement;
