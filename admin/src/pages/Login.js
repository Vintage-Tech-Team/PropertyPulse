import React, { useState } from 'react';
import { Form, Input, Button, Alert, ConfigProvider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Login.css';
import LogoMark from '../components/LogoMark';

// Login-only tweaks on top of the app-wide theme in App.js.
const loginTheme = {
	token: { controlHeightLG: 46 },
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
		<ConfigProvider theme={loginTheme}>
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
