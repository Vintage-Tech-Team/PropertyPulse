import React, { useState } from 'react';
import { Form, Input, Button, Alert, ConfigProvider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Login.css';

const LogoMark = ({ house = '#ffffff', pulse = '#5cc29a' }) => (
	<svg viewBox="20 60 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<g fill="none" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
			<polygon stroke={house} points="50,100 70,80 90,100 90,140 50,140" />
			<polygon stroke={house} points="80,90 100,70 120,90 120,140 80,140" />
			<polygon stroke={house} points="110,100 130,80 150,100 150,140 110,140" />
			<polyline stroke={pulse} points="30,120 60,120 70,100 85,140 100,80 115,120 170,120" />
		</g>
	</svg>
);

const theme = {
	token: {
		colorPrimary: '#2e8b6a',
		colorText: '#10262b',
		colorTextPlaceholder: '#9db0b4',
		colorBorder: '#e2e8ea',
		borderRadius: 10,
		controlHeightLG: 46,
		fontSize: 14,
	},
	components: {
		Button: { primaryShadow: '0 6px 16px rgba(46, 139, 106, 0.25)', fontWeight: 600 },
	},
};

const Login = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const onFinish = async (values) => {
		setLoading(true);
		setError(null);
		try {
			const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/admin/login`, values);
			localStorage.setItem('token', response.data.token);
			message.success('Login successful!');
			window.location.href = '/dashboard';
		} catch (err) {
			setError('Invalid email or password. Please try again.');
			setLoading(false);
		}
	};

	return (
		<ConfigProvider theme={theme}>
			<div className="pp-login">
				<aside className="pp-login__brand">
					<div className="pp-login__logo">
						<LogoMark />
						PropertyPulse
					</div>

					<div className="pp-login__pitch">
						<span className="pp-login__eyebrow">Admin console</span>
						<h1 className="pp-login__headline">Keep every listing, review and tenant in check.</h1>
						<p className="pp-login__sub">
							Verify properties, moderate reviews and manage users across Lahore, Islamabad, Karachi and beyond —
							all from one place.
						</p>
					</div>

					<div className="pp-login__stats">
						<div>
							<strong>Properties</strong>
							Verify &amp; publish
						</div>
						<div>
							<strong>Reviews</strong>
							Moderate &amp; approve
						</div>
						<div>
							<strong>Users</strong>
							Manage access
						</div>
					</div>
				</aside>

				<main className="pp-login__panel">
					<div className="pp-login__card">
						<div className="pp-login__mobile-logo">
							<LogoMark house="#10262b" pulse="#2e8b6a" />
							PropertyPulse
						</div>

						<h2>Welcome back</h2>
						<p>Sign in to the PropertyPulse admin dashboard.</p>

						{error && <Alert className="pp-login__error" type="error" showIcon message={error} />}

						<Form layout="vertical" size="large" requiredMark={false} onFinish={onFinish} onValuesChange={() => error && setError(null)}>
							<Form.Item
								label="Email"
								name="email"
								rules={[
									{ required: true, message: 'Please enter your email' },
									{ type: 'email', message: 'Please enter a valid email' },
								]}
							>
								<Input prefix={<MailOutlined style={{ color: '#9db0b4' }} />} placeholder="admin@propertypulse.com" autoComplete="email" autoFocus />
							</Form.Item>
							<Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
								<Input.Password prefix={<LockOutlined style={{ color: '#9db0b4' }} />} placeholder="Enter your password" autoComplete="current-password" />
							</Form.Item>
							<Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
								<Button type="primary" htmlType="submit" block loading={loading}>
									Sign in
								</Button>
							</Form.Item>
						</Form>

						<div className="pp-login__foot">Restricted area · Authorized administrators only</div>
					</div>
				</main>
			</div>
		</ConfigProvider>
	);
};

export default Login;
