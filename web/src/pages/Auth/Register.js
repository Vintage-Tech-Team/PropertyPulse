import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import logoImage from '../../assets/images/property_pulse.png';

const { Title, Text } = Typography;

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
		<div className={styles.container}>
			{/* Left Side - Logo (hidden on xs screens) */}
			<div className={styles.logoSection}>
				<img src={logoImage} alt="PropertyPulse" className={styles.logo} />
				<Text className={styles.logoText}>Join the future of real estate analytics</Text>
			</div>

			{/* Right Side - Registration Form */}
			<div className={styles.formSection}>
				<div className={styles.formWrapper}>
					<div className={styles.mobileLogoContainer}>
						<img src={logoImage} alt="PropertyPulse" className={styles.mobileLogo} />
						<Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
							Create your Account
						</Title>
						<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 30 }}>
							Get started with PropertyPulse
						</Text>
					</div>
					<Form onFinish={handleSubmit} layout="vertical">
						<Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
							<Input size="large" placeholder="Your full name" />
						</Form.Item>
						<Form.Item
							name="email"
							label="Email"
							rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
						>
							<Input size="large" placeholder="Enter your email" />
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
							<Input.Password size="large" placeholder="Create a strong password" />
						</Form.Item>

						<Button type="primary" htmlType="submit" size="large" block loading={loading}>
							Register
						</Button>
					</Form>
					<Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
						Already have an account? <a href="/login">Log in</a>
					</Text>
				</div>
			</div>
		</div>
	);
};

export default Register;
