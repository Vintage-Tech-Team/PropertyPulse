import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllContactMessages, deleteContactMessage, updateContactMessage } from '../services/contactService';
import UserAvatar from '../components/UserAvatar';
import IconAction from '../components/IconAction';
import dayjs from 'dayjs';

// Queries are loaded in full, so these sort in the browser.
const byText = (key) => (a, b) => (a[key] || '').localeCompare(b[key] || '', undefined, { sensitivity: 'base' });

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
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			sorter: byText('name'),
			render: (name) => (
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<UserAvatar name={name} />
					<span>{name || '—'}</span>
				</div>
			),
		},
		{ title: 'Email', dataIndex: 'email', key: 'email', sorter: byText('email') },
		{ title: 'Phone', dataIndex: 'phone', key: 'phone', sorter: byText('phone') },
		{ title: 'Message', dataIndex: 'message', key: 'message', sorter: byText('message') },
		{
			title: 'Status',
			dataIndex: 'answered',
			key: 'answered',
			sorter: (a, b) => Number(!!a.answered) - Number(!!b.answered),
			render: (answered) => (answered ? 'Answered' : 'Pending'),
		},
		{
			title: 'Received',
			dataIndex: 'createdAt',
			key: 'createdAt',
			width: 130,
			defaultSortOrder: 'descend',
			sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
			render: (date) => (date ? dayjs(date).format('DD MMM YYYY') : '—'),
		},
		{
			title: 'Action',
			key: 'action',
			width: 110,
			render: (_, record) => (
				<div className="pp-actions">
					<IconAction
						icon={<CheckOutlined />}
						label={record.answered ? 'Already answered' : 'Mark as answered'}
						tone="approve"
						disabled={record.answered}
						onConfirm={() => handleMarkAnswered(record._id)}
					/>
					<IconAction
						icon={<DeleteOutlined />}
						label="Delete"
						tone="danger"
						confirm="Delete this message?"
						confirmDescription="This can't be undone."
						okText="Delete"
						onConfirm={() => handleDelete(record._id)}
					/>
				</div>
			),
		},
	];

	return (
		<div>
			<Table dataSource={queries} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} showSorterTooltip={false} />
		</div>
	);
};

export default QueryManagement;
