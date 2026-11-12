import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/Auth/AuthLayout';

const Register = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (values) => {
		setLoading(true);
		try {
			await register(values);
			message.success('Registration successful! Please log in.');
			navigate('/login');
		} catch (err) {
			message.error(err.response?.data?.message || 'Registration failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			eyebrow="Join PropertyPulse"
			title="Create your account"
			subtitle="Get started with honest insights on every property."
			switchLink={
				<>
					Already have an account? <a href="/login">Log in</a>
				</>
			}
		>
			<Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
				<Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
					<Input size="large" placeholder="Your full name" autoComplete="name" />
				</Form.Item>
				<Form.Item
					name="email"
					label="Email"
					rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
				>
					<Input size="large" placeholder="you@example.com" autoComplete="email" />
				</Form.Item>
				<Form.Item
					name="password"
					label="Password"
					rules={[
						{ required: true, message: 'Password is required' },
						{
							pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
							message:
								'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
						},
					]}
				>
					<Input.Password size="large" placeholder="Create a strong password" autoComplete="new-password" />
				</Form.Item>

				<Button type="primary" htmlType="submit" size="large" block loading={loading}>
					Create account
				</Button>
			</Form>
		</AuthLayout>
	);
};

export default Register;
