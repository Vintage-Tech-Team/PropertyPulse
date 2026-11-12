import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { login } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout, { authStyles } from '../../components/Auth/AuthLayout';

const Login = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { setAuth } = useAuth();

	const handleSubmit = async (values) => {
		setLoading(true);
		try {
			const { token } = await login(values);
			localStorage.setItem('token', token);
			setAuth({ isAuthenticated: true });
			message.success('Login successful!');
			navigate('/properties');
		} catch (err) {
			message.error(err.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			eyebrow="Your property, in focus"
			title="Welcome back"
			subtitle="Sign in to continue to your market insights."
			switchLink={
				<>
					Don't have an account? <a href="/register">Sign up</a>
				</>
			}
		>
			<Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
				<Form.Item
					name="email"
					label="Email"
					rules={[
						{
							required: true,
							type: 'email',
							message: 'Please enter a valid email',
						},
					]}
				>
					<Input size="large" placeholder="you@example.com" autoComplete="email" />
				</Form.Item>
				<Form.Item
					name="password"
					label={
						<span className={authStyles.passwordLabel}>
							Password
							<a href="/forgot-password">Forgot password?</a>
						</span>
					}
					rules={[{ required: true, message: 'Please enter your password' }]}
				>
					<Input.Password size="large" placeholder="Enter your password" autoComplete="current-password" />
				</Form.Item>
				<Button type="primary" htmlType="submit" size="large" block loading={loading}>
					Log in
				</Button>
			</Form>
		</AuthLayout>
	);
};

export default Login;
