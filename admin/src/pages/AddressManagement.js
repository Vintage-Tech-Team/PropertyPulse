import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Row, Col, Popconfirm } from 'antd';
import { fetchAddresses, addAddress, deleteAddress } from '../services/addressService';

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

	// Load addresses with optional search query
	const loadAddresses = async (params = {}) => {
		setLoading(true);
		try {
			const { page = pagination.current, limit = pagination.pageSize } = params;
			const data = await fetchAddresses({
				...params,
				page,
				limit,
				sortBy: 'createdAt',
				sortOrder: 'desc',
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
		loadAddresses({ query: value, page: 1 }); // Reset to first page when searching
	};

	const handleTableChange = (paginationParams) => {
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
		loadAddresses();
	}, []);

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
					{ title: 'Street', dataIndex: 'street' },
					{ title: 'House Number', dataIndex: 'houseNumber' },
					{ title: 'Apartment Number', dataIndex: 'apartmentNumber' },
					{ title: 'City', dataIndex: 'city' },
					{ title: 'State', dataIndex: 'state' },
					{ title: 'Country', dataIndex: 'country' },
					{ title: 'Latitude', dataIndex: ['location', 'lat'] },
					{ title: 'Longitude', dataIndex: ['location', 'lng'] },
					{
						title: 'Actions',
						key: 'actions',
						render: (_, record) => (
							<Popconfirm
								title="Delete Address"
								description="Are you sure you want to delete this address?"
								onConfirm={() => handleDelete(record._id)}
								okText="Yes"
								cancelText="No"
							>
								<Button danger>Delete</Button>
							</Popconfirm>
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
