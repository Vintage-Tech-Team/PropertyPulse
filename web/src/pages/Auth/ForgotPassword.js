import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import axios from 'axios';
import api from '../../services/api';

const { Title, Text } = Typography;

const ForgotPassword = () => {
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (values) => {
		setLoading(true);
		try {
			await api.post('/auth/forgot-password', values);
			message.success('Password reset email sent!');
		} catch (err) {
			message.error(err.response?.data?.message || 'Something went wrong');
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
					Forgot your password?
				</Title>
				<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 30 }}>
					Enter your email to receive reset instructions
				</Text>
				<Form layout="vertical" onFinish={handleSubmit}>
					<Form.Item
						name="email"
						label="Email"
						rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
					>
						<Input size="large" placeholder="Enter your email" />
					</Form.Item>
					<Button type="primary" htmlType="submit" size="large" block loading={loading}>
						Send Reset Link
					</Button>
				</Form>
			</Card>
		</div>
	);
};

export default ForgotPassword;
