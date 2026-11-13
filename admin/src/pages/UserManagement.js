import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Row, Col, Tag, Radio, Space, Pagination } from 'antd';
import { fetchUsers, addUser, deleteUser, updateUser } from '../services/userService';
import { CheckOutlined, StopOutlined, DeleteOutlined } from '@ant-design/icons';
import UserAvatar from '../components/UserAvatar';
import IconAction from '../components/IconAction';
import useServerSort from '../hooks/useServerSort';

const { Search } = Input;

const UserManagement = () => {
	const [users, setUsers] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [verificationFilter, setVerificationFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const { sort, sortable, handleSorter } = useServerSort();
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 20,
		total: 0,
	});

	const loadUsers = async (params = {}) => {
		try {
			setLoading(true);
			const { page = pagination.current, limit = pagination.pageSize } = params;

			// Build filter parameters
			const filterParams = {
				...params,
				page,
				limit,
				...sort,
			};

			if (searchQuery) filterParams.query = searchQuery;

			// Add verification filter if not 'all'
			if (verificationFilter !== 'all') {
				filterParams.verified = verificationFilter === 'verified';
			}

			console.log('Fetching users with params:', filterParams); // Add logging to debug

			const data = await fetchUsers(filterParams);
			setUsers(data.users);
			setPagination({
				...pagination,
				current: data.page,
				total: data.total,
				pageSize: data.limit,
			});
		} catch (err) {
			console.error('Error fetching users:', err); // Add error logging
			message.error('Failed to fetch users');
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (values) => {
		try {
			await addUser(values);
			message.success('User added successfully!');
			setIsModalOpen(false);
			loadUsers();
		} catch (err) {
			message.error('Failed to add user');
		}
	};

	const handleDelete = async (userId) => {
		try {
			await deleteUser(userId);
			message.success('User deleted successfully!');
			loadUsers();
		} catch (err) {
			message.error('Failed to delete user');
		}
	};

	const handleSearch = (value) => {
		setSearchQuery(value);
	};

	const handleTableChange = (paginationParams) => {
		loadUsers({
			page: paginationParams.current,
			limit: paginationParams.pageSize,
		}); // Remove filter here as it's handled in loadUsers
	};

	useEffect(() => {
		loadUsers({ page: 1 });
	}, [verificationFilter, searchQuery, sort]);

	const handleApprove = async (userId) => {
		try {
			await updateUser(userId, { verified: true });
			message.success('User verified successfully!');
			loadUsers();
		} catch (err) {
			message.error('Failed to verify user');
		}
	};

	const handleBlock = async (userId) => {
		try {
			await updateUser(userId, { verified: false });
			message.success('User blocked successfully!');
			loadUsers();
		} catch (err) {
			message.error('Failed to block user');
		}
	};

	const handleVerificationFilterChange = (e) => {
		const value = e.target.value;
		setVerificationFilter(value);
		setPagination((prev) => ({ ...prev, current: 1 }));
	};

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
						<Space size="large">
							<Radio.Group
								value={verificationFilter}
								onChange={handleVerificationFilterChange}
								optionType="button"
								buttonStyle="solid"
							>
								<Radio.Button value="all">All Users</Radio.Button>
								<Radio.Button value="verified">
									<Tag color="green">Verified</Tag>
								</Radio.Button>
								<Radio.Button value="unverified">
									<Tag color="red">Unverified</Tag>
								</Radio.Button>
							</Radio.Group>
							<Search
								placeholder="Search by name or email"
								onSearch={handleSearch}
								enterButton
								style={{ width: 400 }}
							/>
						</Space>
					</Col>
					<Col>
						<Button type="primary" onClick={() => setIsModalOpen(true)}>
							Add User
						</Button>
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
				<Table
					loading={loading}
					dataSource={users}
					rowKey="_id"
					pagination={false}
					onChange={(_, __, sorter) => handleSorter(sorter)}
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
						{
							title: 'Name',
							dataIndex: 'name',
							...sortable('name'),
							render: (name, record) => (
								<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
									<UserAvatar name={name} src={record.profileImage} />
									<span>{name || '—'}</span>
								</div>
							),
						},
						{ title: 'Email', dataIndex: 'email', ...sortable('email') },
						{ title: 'Role', dataIndex: 'role', ...sortable('role') },
						{
							title: 'Verified',
							dataIndex: 'verified',
							...sortable('verified'),
							render: (_, record) => {
								return record.verified === true ? (
									<Tag color="green">Verified</Tag>
								) : (
									<Tag color="red">Not Verified</Tag>
								);
							},
						},
						{
							title: 'Action',
							width: 110,
							render: (_, record) => (
								<div className="pp-actions">
									{record.verified ? (
										<IconAction
											icon={<StopOutlined />}
											label="Block"
											tone="warn"
											confirm="Block this user?"
											onConfirm={() => handleBlock(record._id)}
										/>
									) : (
										<IconAction
											icon={<CheckOutlined />}
											label="Verify"
											tone="approve"
											confirm="Verify this user?"
											onConfirm={() => handleApprove(record._id)}
										/>
									)}
									<IconAction
										icon={<DeleteOutlined />}
										label="Delete"
										tone="danger"
										confirm="Delete this user?"
										confirmDescription="This can't be undone."
										okText="Delete"
										onConfirm={() => handleDelete(record._id)}
									/>
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
					current={pagination.current}
					pageSize={pagination.pageSize}
					total={pagination.total}
					showSizeChanger
					pageSizeOptions={['20', '30', '50']}
					showTotal={(total) => `Total ${total} users`}
					onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })}
				/>
			</div>

			{/* Modal */}
			<Modal
				title="Add User"
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => form.submit()}
			>
				<Form form={form} onFinish={onSubmit}>
					<Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
						<Input placeholder="Name" />
					</Form.Item>
					<Form.Item name="email" rules={[{ required: true, message: 'Email is required' }]}>
						<Input placeholder="Email" />
					</Form.Item>
					<Form.Item name="password" rules={[{ required: true, message: 'Password is required' }]}>
						<Input.Password placeholder="Password" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default UserManagement;
