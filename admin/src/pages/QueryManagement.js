import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message } from 'antd';
import { getAllContactMessages, deleteContactMessage, updateContactMessage } from '../services/contactService';

const QueryManagement = () => {
	const [queries, setQueries] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchQueries = async () => {
		setLoading(true);
		try {
			const res = await getAllContactMessages();
			setQueries(res.data);
		} catch (error) {
			message.error('Failed to fetch contact messages.');
		}
		setLoading(false);
	};

	const handleDelete = async (id) => {
		try {
			await deleteContactMessage(id);
			message.success('Message deleted.');
			fetchQueries();
		} catch (error) {
			message.error('Failed to delete message.');
		}
	};

	const handleMarkAnswered = async (id) => {
		try {
			await updateContactMessage(id, { answered: true });
			message.success('Marked as answered.');
			fetchQueries();
		} catch (error) {
			message.error('Failed to update message.');
		}
	};

	useEffect(() => {
		fetchQueries();
	}, []);

	const columns = [
		{ title: 'Name', dataIndex: 'name', key: 'name' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Phone', dataIndex: 'phone', key: 'phone' },
		{ title: 'Message', dataIndex: 'message', key: 'message' },
		{
			title: 'Status',
			dataIndex: 'answered',
			key: 'answered',
			render: (answered) => (answered ? 'Answered' : 'Pending'),
		},
		{
			title: 'Action',
			key: 'action',
			render: (_, record) => (
				<div style={{ display: 'flex', gap: 8 }}>
					<Popconfirm
						title="Are you sure to delete this message?"
						onConfirm={() => handleDelete(record._id)}
						okText="Yes"
						cancelText="No"
					>
						<Button danger size="small">
							Delete
						</Button>
					</Popconfirm>
					{record.answered ? (
						<Button size="small" disabled>
							Answered
						</Button>
					) : (
						<Button size="small" type="primary" onClick={() => handleMarkAnswered(record._id)}>
							Mark as Answered
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<div>
			<h2>Contact Queries</h2>
			<Table dataSource={queries} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
		</div>
	);
};

export default QueryManagement;
