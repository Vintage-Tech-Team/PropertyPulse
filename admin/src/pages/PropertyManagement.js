import React, { useEffect, useState } from 'react';
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	message,
	DatePicker,
	Segmented,
	Pagination,
	Typography,
	Upload,
	Row,
	Col,
} from 'antd';
import {
	SearchOutlined,
	PlusOutlined,
	DeleteOutlined,
	CheckOutlined,
	StopOutlined,
	EnvironmentOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import IconAction from '../components/IconAction';
import UserAvatar from '../components/UserAvatar';
import useServerSort from '../hooks/useServerSort';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, addProperty, deleteProperty, updateProperty } from '../services/propertyService';
import { fetchAddresses } from '../services/addressService';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import './PropertyManagement.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;


const PropertyManagement = () => {
	const [properties, setProperties] = useState([]);
	const [addresses, setAddresses] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
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
	const { sort, sortable, handleSorter } = useServerSort();

	// Effect to load properties when filters change
	useEffect(() => {
		console.log('Filter changed - Current filter:', verificationFilter);
		loadProperties();
	}, [verificationFilter, dateRange, searchQuery, pagination.current, pagination.pageSize, sort]);

	// Go back to page 1 whenever the sort changes
	useEffect(() => {
		setPagination((prev) => (prev.current === 1 ? prev : { ...prev, current: 1 }));
	}, [sort]);

	const loadProperties = async () => {
		setLoading(true);
		try {
			// Build filter parameters
			const filterParams = {
				page: pagination.current,
				limit: pagination.pageSize,
				isAdmin: true,
				...sort,
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

	const closeModal = () => {
		setIsModalOpen(false);
		form.resetFields();
	};

	// The API takes multipart form data: text fields plus `electricityBill` (1 image, required)
	// and `files` (property photos, up to 9).
	const onSubmit = async ({ electricityBill, photos, ...values }) => {
		const formData = new FormData();
		Object.entries({ ...values, createdBy: userID }).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') formData.append(key, value);
		});
		formData.append('electricityBill', electricityBill[0].originFileObj);
		(photos || []).forEach((file) => formData.append('files', file.originFileObj));

		setSaving(true);
		try {
			await addProperty(formData);
			message.success('Property added successfully!');
			closeModal();
			loadProperties();
		} catch (err) {
			const detail = err.response?.data?.error || err.response?.data?.message;
			message.error(detail || 'Failed to add property');
		} finally {
			setSaving(false);
		}
	};

	// Address picker searches the server, since the list is paginated
	const searchAddresses = React.useMemo(
		() =>
			debounce(async (query) => {
				try {
					const data = await fetchAddresses({ query: query?.trim() || undefined, limit: 50, sortBy: 'societyTown', sortOrder: 'asc' });
					setAddresses(data.addresses || []);
				} catch {
					// keep the current list
				}
			}, 300),
		[],
	);

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

	const handleVerificationFilterChange = (value) => {
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
	}, []);

	const debouncedSearch = React.useMemo(() => debounce((value) => handleSearch(value.trim()), 400), []);
	useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

	const formatAddress = (address) =>
		[address?.houseNumber, address?.street, address?.block, address?.societyTown].filter(Boolean).join(', ');

	const columns = [
		{
			title: '#',
			key: 'serialNumber',
			width: 56,
			render: (_, __, index) => (
				<span className="pp-muted">{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
			),
		},
		{
			title: 'Property',
			dataIndex: 'name',
			...sortable('name'),
			render: (name, record) => (
				<div className="pp-cell-stack">
					<span className="pp-strong">{name}</span>
					<Text
						className="pp-id"
						copyable={{ text: record._id, tooltips: ['Copy ID', 'Copied'] }}
						onClick={(e) => e.stopPropagation()}
					>
						{record._id.slice(-8)}
					</Text>
				</div>
			),
		},
		{
			title: 'Owner',
			dataIndex: 'owner',
			...sortable('owner'),
			render: (owner, record) => (
				<div className="pp-owner">
					<UserAvatar name={owner} />
					<div className="pp-cell-stack">
						<span>{owner || '—'}</span>
						<span className="pp-muted pp-small">{record.consumerId || 'No consumer ID'}</span>
					</div>
				</div>
			),
		},
		{
			title: 'Location',
			key: 'address',
			width: 300,
			render: (_, record) => (
				<div className="pp-cell-stack">
					<span className="pp-clamp">{formatAddress(record.address) || '—'}</span>
					{record.address?.city && (
						<span className="pp-city">
							<EnvironmentOutlined /> {record.address.city}
						</span>
					)}
				</div>
			),
		},
		{
			title: 'Status',
			dataIndex: 'verified',
			...sortable('verified'),
			width: 130,
			render: (verified) => (
				<span className={`pp-status ${verified ? 'is-verified' : 'is-pending'}`}>
					{verified ? 'Verified' : 'Unverified'}
				</span>
			),
		},
		{
			title: 'Created',
			dataIndex: 'createdAt',
			...sortable('createdAt'),
			width: 130,
			render: (date) => <span className="pp-muted">{date ? dayjs(date).format('DD MMM YYYY') : '—'}</span>,
		},
		{
			title: '',
			key: 'action',
			width: 100,
			align: 'right',
			render: (_, record) => (
				<div className="pp-actions" onClick={(e) => e.stopPropagation()}>
					{record.verified ? (
						<IconAction
							icon={<StopOutlined />}
							label="Unapprove"
							tone="neutral"
							confirm="Unapprove this property?"
							onConfirm={() => handleUnapprove(record._id)}
						/>
					) : (
						<IconAction
							icon={<CheckOutlined />}
							label="Approve"
							tone="approve"
							confirm="Approve this property?"
							onConfirm={() => handleApprove(record._id)}
						/>
					)}
					<IconAction
						icon={<DeleteOutlined />}
						label="Delete"
						tone="danger"
						confirm="Delete this property?"
						confirmDescription="This can't be undone."
						okText="Delete"
						onConfirm={() => handleDelete(record._id)}
					/>
				</div>
			),
		},
	];

	return (
		<div className="pp-page">
			{/* Toolbar */}
			<div className="pp-toolbar">
				<Input
					className="pp-search"
					prefix={<SearchOutlined style={{ color: '#9db0b4' }} />}
					placeholder="Search by name, owner or address"
					allowClear
					onChange={(e) => debouncedSearch(e.target.value)}
				/>
				<Segmented
					value={verificationFilter}
					onChange={handleVerificationFilterChange}
					options={[
						{ label: 'All', value: 'all' },
						{ label: 'Verified', value: 'verified' },
						{ label: 'Unverified', value: 'unverified' },
					]}
				/>
				<RangePicker onChange={handleDateRangeChange} value={dateRange} format="DD MMM YYYY" />
				<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} className="pp-add">
					Add property
				</Button>
			</div>

			{/* Table */}
			<div className="pp-table-wrap">
				<Table
					loading={loading}
					dataSource={properties}
					rowKey="_id"
					pagination={false}
					onChange={(_, __, sorter) => handleSorter(sorter)}
					showSorterTooltip={false}
					sticky
					scroll={{ x: 1000 }}
					onRow={(record) => ({
						onClick: () => navigate(`/dashboard/properties/${record._id}`),
						style: { cursor: 'pointer' },
					})}
					columns={columns}
				/>
			</div>

			{/* Pagination */}
			<div className="pp-footer">
				<span className="pp-muted">
					{pagination.total
						? `Showing ${(pagination.current - 1) * pagination.pageSize + 1}–${Math.min(
								pagination.current * pagination.pageSize,
								pagination.total,
						  )} of ${pagination.total} properties`
						: 'No properties'}
				</span>
				<Pagination
					{...pagination}
					showSizeChanger
					pageSizeOptions={['20', '30', '50']}
					onChange={(page, pageSize) => {
						console.log('Pagination changed:', { page, pageSize });
						handleTableChange({ current: page, pageSize });
					}}
				/>
			</div>

			{/* Modal */}
			<Modal
				title="Add property"
				open={isModalOpen}
				onCancel={closeModal}
				onOk={() => form.submit()}
				okText="Add property"
				confirmLoading={saving}
				width={620}
				destroyOnClose
				afterOpenChange={(open) => open && searchAddresses('')}
			>
				<Form form={form} onFinish={onSubmit} layout="vertical" requiredMark="optional" style={{ marginTop: 16 }}>
					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item
								label="Property name"
								name="name"
								rules={[{ required: true, whitespace: true, message: 'Name is required' }]}
							>
								<Input placeholder="e.g. DHA Phase 6 Modern House" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Owner" name="owner" rules={[{ required: true, whitespace: true, message: 'Owner is required' }]}>
								<Input placeholder="Owner name" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Consumer ID"
								name="consumerId"
								tooltip="Reference number from the electricity bill. Must be unique."
								rules={[{ required: true, whitespace: true, message: 'Consumer ID is required' }]}
							>
								<Input placeholder="e.g. 0412345678901" />
							</Form.Item>
						</Col>
						<Col xs={24}>
							<Form.Item label="Address" name="address" rules={[{ required: true, message: 'Address is required' }]}>
								<Select
									placeholder="Search by society, street or city"
									showSearch
									filterOption={false}
									onSearch={searchAddresses}
									notFoundContent="No matching addresses — add one in the Addresses tab"
									options={addresses.map((addr) => ({
										value: addr._id,
										label: [addr.houseNumber, addr.street, addr.block && `Block ${addr.block}`, addr.societyTown, addr.city]
											.filter(Boolean)
											.join(', '),
									}))}
								/>
							</Form.Item>
						</Col>
						<Col xs={24}>
							<Form.Item label="Description" name="description">
								<Input.TextArea rows={3} placeholder="Short description of the property" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={10}>
							<Form.Item
								label="Electricity bill"
								name="electricityBill"
								valuePropName="fileList"
								getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
								rules={[{ required: true, message: 'Electricity bill image is required' }]}
								extra="Photo or scan, used to verify the owner"
							>
								<Upload accept="image/*" maxCount={1} beforeUpload={() => false} listType="picture">
									<Button icon={<UploadOutlined />}>Upload bill</Button>
								</Upload>
							</Form.Item>
						</Col>
						<Col xs={24} sm={14}>
							<Form.Item
								label="Property photos"
								name="photos"
								valuePropName="fileList"
								getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
								extra="Up to 9 images"
							>
								<Upload accept="image/*" multiple maxCount={9} beforeUpload={() => false} listType="picture-card">
									<div>
										<PlusOutlined />
										<div style={{ marginTop: 6, fontSize: 12 }}>Add</div>
									</div>
								</Upload>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default PropertyManagement;
