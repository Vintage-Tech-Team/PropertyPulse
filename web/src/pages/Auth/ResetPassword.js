import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import AuthLayout from '../../components/Auth/AuthLayout';

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleSubmit = async ({ password }) => {
		setLoading(true);
		try {
			await resetPassword(token, password);
			message.success('Password reset successful! Please log in.');
			navigate('/login');
		} catch (err) {
			message.error(err.response?.data?.message || 'Reset failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			eyebrow="Account recovery"
			title="Set a new password"
			subtitle="Choose a strong password you haven't used before."
			switchLink={
				<>
					Link expired? <a href="/forgot-password">Request a new one</a>
				</>
			}
		>
			<Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
				<Form.Item
					name="password"
					label="New password"
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
				<Form.Item
					name="confirmPassword"
					label="Confirm new password"
					dependencies={['password']}
					rules={[
						{ required: true, message: 'Please confirm your password' },
						({ getFieldValue }) => ({
							validator: (_, value) =>
								!value || getFieldValue('password') === value
									? Promise.resolve()
									: Promise.reject(new Error('Passwords do not match')),
						}),
					]}
				>
					<Input.Password size="large" placeholder="Re-enter your new password" autoComplete="new-password" />
				</Form.Item>
				<Button type="primary" htmlType="submit" size="large" block loading={loading}>
					Reset password
				</Button>
			</Form>
		</AuthLayout>
	);
};

export default ResetPassword;
