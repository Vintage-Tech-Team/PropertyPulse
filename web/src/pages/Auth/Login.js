import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { login } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';
import logoImage from '../../assets/images/property_pulse.png';

const { Title, Text } = Typography;

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
		<div className={styles.container}>
			{/* Left Side - Logo (hidden on xs screens) */}
			<div className={styles.logoSection}>
				<img src={logoImage} alt="PropertyPulse" className={styles.logo} />
				<Text className={styles.logoText}>Your trusted partner in real estate analytics</Text>
			</div>

			{/* Right Side - Login Form */}
			<div className={styles.formSection}>
				<div className={styles.formWrapper}>
					<div className={styles.mobileLogoContainer}>
						<img src={logoImage} alt="PropertyPulse" className={styles.mobileLogo} />
						<Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
							Welcome Back
						</Title>
						<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 30 }}>
							Please log in to continue
						</Text>
					</div>
					<Form onFinish={handleSubmit} layout="vertical">
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
							<Input size="large" placeholder="Enter your email" />
						</Form.Item>
						<Form.Item
							name="password"
							label="Password"
							rules={[{ required: true, message: 'Please enter your password' }]}
						>
							<Input.Password size="large" placeholder="Enter your password" />
						</Form.Item>
						<Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: 10 }}>
							Log In
						</Button>
					</Form>
					<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
						Forgot your password? <a href="/forgot-password">Reset here</a>
					</Text>
					<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>
						Don't have an account? <a href="/register">Sign up</a>
					</Text>
				</div>
			</div>
		</div>
	);
};

export default Login;
