import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { fetchAddresses, addAddress, deleteAddress } from '../services/addressService';
import IconAction from '../components/IconAction';
import useServerSort from '../hooks/useServerSort';

const { Search } = Input;

const AddressManagement = () => {
	const [addresses, setAddresses] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 20,
		total: 0,
	});

	const [searchQuery, setSearchQuery] = useState('');
	const { sort, sortable, handleSorter } = useServerSort();

	// Load addresses with optional search query
	const loadAddresses = async (params = {}) => {
		setLoading(true);
		try {
			const { page = pagination.current, limit = pagination.pageSize } = params;
			const data = await fetchAddresses({
				...params,
				page,
				limit,
				query: searchQuery || undefined,
				...sort,
			});
			setAddresses(data.addresses);
			setPagination({
				...pagination,
				current: data.page,
				total: data.total,
				pageSize: data.limit,
			});
		} catch (err) {
			message.error('Failed to fetch addresses');
		} finally {
			setLoading(false);
		}
	};

	// Handle form submission for adding address
	const onSubmit = async (values) => {
		try {
			const formattedValues = {
				...values,
				postalCode: '54000',
				location: {
					lat: parseFloat(values.lat),
					lng: parseFloat(values.lng),
				},
			};
			delete formattedValues.lat;
			delete formattedValues.lng;

			await addAddress(formattedValues);
			message.success('Address added successfully!');
			setIsModalOpen(false);
			form.resetFields();
			loadAddresses();
		} catch (err) {
			message.error('Failed to add address');
		}
	};

	// Handle search input
	const handleSearch = (value) => {
		setSearchQuery(value);
	};

	const handleTableChange = (paginationParams, _filters, sorter, extra) => {
		if (extra?.action === 'sort') {
			handleSorter(sorter);
			return;
		}
		loadAddresses({
			page: paginationParams.current,
			limit: paginationParams.pageSize,
		});
	};

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

	return (
		<div>
			<Row gutter={[16, 16]} align="middle" style={{ marginBottom: '20px' }}>
				<Col>
					<Button type="primary" onClick={() => setIsModalOpen(true)}>
						Add Address
					</Button>
				</Col>

				<Col>
					<Search placeholder="Search by address fields" onSearch={handleSearch} enterButton style={{ width: 400 }} />
				</Col>
			</Row>

			<Table
				loading={loading}
				dataSource={addresses}
				rowKey="_id"
				scroll={{ y: 'calc(100vh - 300px)' }}
				pagination={{
					current: pagination.current,
					pageSize: pagination.pageSize,
					total: pagination.total,
					showSizeChanger: true,
					pageSizeOptions: ['20', '30', '50'],
					showTotal: (total) => `Total ${total} addresses`,
					position: ['bottomCenter'],
					style: {
						position: 'sticky',
						bottom: 0,
						width: '100%',
						padding: '10px 0',
						backgroundColor: 'white',
						zIndex: 1,
						borderTop: '1px solid #f0f0f0',
					},
				}}
				onChange={handleTableChange}
				showSorterTooltip={false}
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
					{ title: 'Street', dataIndex: 'street', ...sortable('street') },
					{ title: 'House Number', dataIndex: 'houseNumber', ...sortable('houseNumber') },
					{ title: 'Apartment Number', dataIndex: 'apartmentNumber', ...sortable('apartmentNumber') },
					{ title: 'City', dataIndex: 'city', ...sortable('city') },
					{ title: 'State', dataIndex: 'state', ...sortable('state') },
					{ title: 'Country', dataIndex: 'country', ...sortable('country') },
					{ title: 'Latitude', dataIndex: ['location', 'lat'] },
					{ title: 'Longitude', dataIndex: ['location', 'lng'] },
					{
						title: 'Actions',
						key: 'actions',
						width: 80,
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
				]}
			/>
			<Modal title="Add Address" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
				<Form form={form} onFinish={onSubmit}>
					<Form.Item name="street" rules={[{ required: true, message: 'Street is required' }]}>
						<Input placeholder="Street" />
					</Form.Item>
					<Form.Item name="houseNumber">
						<Input placeholder="House Number" />
					</Form.Item>
					<Form.Item name="apartmentNumber">
						<Input placeholder="Apartment Number" />
					</Form.Item>
					<Form.Item name="city" rules={[{ required: true, message: 'City is required' }]}>
						<Input placeholder="City" />
					</Form.Item>
					<Form.Item name="state" rules={[{ required: true, message: 'State is required' }]}>
						<Input placeholder="State" />
					</Form.Item>
					<Form.Item name="country" rules={[{ required: true, message: 'Country is required' }]}>
						<Input placeholder="Country" />
					</Form.Item>
					<Form.Item name="lat" rules={[{ required: true, message: 'Latitude is required' }]}>
						<Input placeholder="Latitude" />
					</Form.Item>
					<Form.Item name="lng" rules={[{ required: true, message: 'Longitude is required' }]}>
						<Input placeholder="Longitude" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default AddressManagement;
