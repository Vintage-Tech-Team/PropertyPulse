import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (values) => {
		setLoading(true);
		try {
			await axios.post(`/api/auth/reset-password/${token}`, values);
			message.success('Password reset successful!');
			navigate('/login');
		} catch (err) {
			message.error(err.response?.data?.message || 'Reset failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: 'calc(100vh - 18px)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#f0f2f5',
			}}
		>
			<Card style={{ width: 400, padding: 20, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
				<Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
					Reset your password
				</Title>
				<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 30 }}>
					Set a new password below
				</Text>
				<Form layout="vertical" onFinish={handleSubmit}>
					<Form.Item name="password" label="New Password" rules={[{ required: true, message: 'Password is required' }]}>
						<Input.Password size="large" placeholder="Enter new password" />
					</Form.Item>
					<Button type="primary" htmlType="submit" size="large" block loading={loading}>
						Reset Password
					</Button>
				</Form>
			</Card>
		</div>
	);
};

export default ResetPassword;
