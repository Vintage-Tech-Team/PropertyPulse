import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Pagination, Row, Col, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { fetchAddresses, addAddress, deleteAddress } from '../services/addressService';
import IconAction from '../components/IconAction';
import useServerSort from '../hooks/useServerSort';
import './PropertyManagement.css';

const { Text } = Typography;

const AddressManagement = () => {
	const [addresses, setAddresses] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 20,
		total: 0,
	});

	const [searchQuery, setSearchQuery] = useState('');
	const { sort, sortable, handleSorter } = useServerSort();

	// Load addresses using the current search + sort
	const loadAddresses = async (params = {}) => {
		setLoading(true);
		try {
			const { page = pagination.current, limit = pagination.pageSize } = params;
			const data = await fetchAddresses({
				page,
				limit,
				query: searchQuery || undefined,
				...sort,
			});
			setAddresses(data.addresses);
			setPagination((prev) => ({
				...prev,
				current: Number(data.page) || page,
				total: data.total,
				pageSize: Number(data.limit) || limit,
			}));
		} catch (err) {
			message.error('Failed to fetch addresses');
		} finally {
			setLoading(false);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
		form.resetFields();
	};

	// Handle form submission for adding address
	const onSubmit = async ({ lat, lng, ...rest }) => {
		setSaving(true);
		try {
			await addAddress({ ...rest, location: { lat, lng } });
			message.success('Address added successfully!');
			closeModal();
			loadAddresses();
		} catch (err) {
			const detail = err.response?.data?.error || err.response?.data?.message;
			message.error(detail ? `Failed to add address: ${detail}` : 'Failed to add address');
		} finally {
			setSaving(false);
		}
	};

	const debouncedSearch = useMemo(() => debounce((value) => setSearchQuery(value.trim()), 400), []);
	useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

	const handleDelete = async (id) => {
		try {
			await deleteAddress(id);
			message.success('Address deleted successfully');
			loadAddresses();
		} catch (err) {
			message.error('Failed to delete address');
		}
	};

	useEffect(() => {
		loadAddresses({ page: 1 });
	}, [searchQuery, sort]);

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
			title: 'Society / Town',
			dataIndex: 'societyTown',
			width: 240,
			...sortable('societyTown'),
			render: (societyTown, record) => (
				<div className="pp-cell-stack">
					<span className="pp-strong">{societyTown || '—'}</span>
					<Text className="pp-id" copyable={{ text: record._id, tooltips: ['Copy ID', 'Copied'] }}>
						{record._id.slice(-8)}
					</Text>
				</div>
			),
		},
		{
			title: 'Street',
			dataIndex: 'street',
			width: 220,
			...sortable('street'),
			render: (street, record) => (
				<div className="pp-cell-stack">
					<span>{street || '—'}</span>
					<span className="pp-muted pp-small">
						{[
							record.houseNumber && `House ${record.houseNumber}`,
							record.apartmentNumber && `Apt ${record.apartmentNumber}`,
							record.block && `Block ${record.block}`,
						]
							.filter(Boolean)
							.join(' · ') || '—'}
					</span>
				</div>
			),
		},
		{
			title: 'City',
			dataIndex: 'city',
			width: 140,
			...sortable('city'),
			render: (city) => (
				<span className="pp-city">
					<EnvironmentOutlined /> {city}
				</span>
			),
		},
		{ title: 'State', dataIndex: 'state', width: 130, ...sortable('state') },
		{ title: 'Country', dataIndex: 'country', width: 120, ...sortable('country') },
		{
			title: 'Coordinates',
			key: 'location',
			width: 170,
			render: (_, record) =>
				record.location?.lat != null ? (
					<span className="pp-coords">
						{Number(record.location.lat).toFixed(5)}, {Number(record.location.lng).toFixed(5)}
					</span>
				) : (
					'—'
				),
		},
		{
			title: '',
			key: 'actions',
			width: 70,
			align: 'right',
			render: (_, record) => (
				<IconAction
					icon={<DeleteOutlined />}
					label="Delete"
					tone="danger"
					confirm="Delete this address?"
					confirmDescription="This can't be undone."
					okText="Delete"
					onConfirm={() => handleDelete(record._id)}
				/>
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
					placeholder="Search by society, street or city"
					allowClear
					onChange={(e) => debouncedSearch(e.target.value)}
				/>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} className="pp-add">
					Add address
				</Button>
			</div>

			{/* Table */}
			<div className="pp-table-wrap">
				<Table
					loading={loading}
					dataSource={addresses}
					rowKey="_id"
					pagination={false}
					sticky
					scroll={{ x: 1150 }}
					onChange={(_, __, sorter) => handleSorter(sorter)}
					showSorterTooltip={false}
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
						  )} of ${pagination.total} addresses`
						: 'No addresses'}
				</span>
				<Pagination
					current={pagination.current}
					pageSize={pagination.pageSize}
					total={pagination.total}
					showSizeChanger
					pageSizeOptions={['20', '30', '50']}
					onChange={(page, pageSize) => loadAddresses({ page, limit: pageSize })}
				/>
			</div>

			{/* Add address */}
			<Modal
				title="Add address"
				open={isModalOpen}
				onCancel={closeModal}
				onOk={() => form.submit()}
				okText="Add address"
				confirmLoading={saving}
				width={620}
				destroyOnClose
			>
				<Form
					form={form}
					onFinish={onSubmit}
					layout="vertical"
					requiredMark="optional"
					initialValues={{ country: 'Pakistan' }}
					style={{ marginTop: 16 }}
				>
					<Row gutter={16}>
						<Col xs={24} sm={16}>
							<Form.Item
								label="Society / Town"
								name="societyTown"
								rules={[{ required: true, whitespace: true, message: 'Society / Town is required' }]}
							>
								<Input placeholder="e.g. DHA Phase 6" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={8}>
							<Form.Item label="Block" name="block">
								<Input placeholder="e.g. L" />
							</Form.Item>
						</Col>
						<Col xs={24}>
							<Form.Item label="Street" name="street">
								<Input placeholder="e.g. Street 3" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="House number" name="houseNumber">
								<Input placeholder="e.g. 24-C" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Apartment number" name="apartmentNumber">
								<Input placeholder="e.g. 4B" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={8}>
							<Form.Item
								label="City"
								name="city"
								rules={[{ required: true, whitespace: true, message: 'City is required' }]}
							>
								<Input placeholder="e.g. Lahore" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={8}>
							<Form.Item
								label="Province / State"
								name="state"
								rules={[{ required: true, whitespace: true, message: 'Province is required' }]}
							>
								<Input placeholder="e.g. Punjab" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={8}>
							<Form.Item
								label="Country"
								name="country"
								rules={[{ required: true, whitespace: true, message: 'Country is required' }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Latitude" name="lat" rules={[{ required: true, message: 'Latitude is required' }]}>
								<InputNumber min={-90} max={90} step={0.000001} placeholder="31.457383" style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Longitude" name="lng" rules={[{ required: true, message: 'Longitude is required' }]}>
								<InputNumber min={-180} max={180} step={0.000001} placeholder="74.265472" style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default AddressManagement;
