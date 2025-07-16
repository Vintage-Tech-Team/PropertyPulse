import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { fetchAddresses } from '../services/addressService';
import { fetchParkingSpots, addParkingSpot, updateParkingSpot } from '../services/parkingService';

const ParkingManagement = () => {
	const [spots, setSpots] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [addresses, setAddresses] = useState([]);
	const [form] = Form.useForm();

	useEffect(() => {
		loadParkingSpots();
		loadAddresses();
	}, []);

	const columns = [
		{ title: 'Name', dataIndex: 'name', key: 'name' },
		{
			title: 'Address',
			key: 'address',
			render: (_, record) => (
				<span>
					{record.address?.houseNumber} {record.address?.street},{record.address?.city}
				</span>
			),
		},
		{ title: 'Price', dataIndex: 'price', key: 'price' },
		{
			title: 'Available',
			dataIndex: 'isAvailable',
			key: 'isAvailable',
			render: (isAvailable) => <Switch checked={isAvailable} disabled />,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => (
				<Button.Group>
					<Button type="primary">Edit</Button>
					<Button danger>Delete</Button>
				</Button.Group>
			),
		},
	];

	return (
		<div style={{ padding: '24px' }}>
			<Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: '16px' }}>
				Add Parking Spot
			</Button>

			<Table columns={columns} dataSource={spots} rowKey="_id" loading={loading} />

			<Modal
				title="Add Parking Spot"
				open={isModalVisible}
				onOk={form.submit}
				onCancel={() => setIsModalVisible(false)}
			>
				<Form form={form} layout="vertical">
					<Form.Item name="name" label="Name" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name="description" label="Description" rules={[{ required: true }]}>
						<Input.TextArea />
					</Form.Item>
					<Form.Item name="price" label="Price" rules={[{ required: true }]}>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name="address" label="Address" rules={[{ required: true }]}>
						<Select>
							{addresses.map((addr) => (
								<Select.Option key={addr._id} value={addr._id}>
									{addr.houseNumber} {addr.street}, {addr.city}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name="isAvailable" valuePropName="checked">
						<Switch checkedChildren="Available" unCheckedChildren="Unavailable" />
					</Form.Item>
					<Form.Item name="images" label="Images">
						<Upload multiple beforeUpload={() => false}>
							<Button icon={<UploadOutlined />}>Upload Images</Button>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ParkingManagement;
