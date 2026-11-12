import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import api from '../../services/api';
import AuthLayout from '../../components/Auth/AuthLayout';

const ForgotPassword = () => {
	const [loading, setLoading] = useState(false);
	const [sentTo, setSentTo] = useState(null);

	const handleSubmit = async (values) => {
		setLoading(true);
		try {
			await api.post('/auth/forgot-password', values);
			message.success('Password reset email sent!');
			setSentTo(values.email);
		} catch (err) {
			message.error(err.response?.data?.message || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	const backToLogin = (
		<>
			Remembered it? <a href="/login">Back to log in</a>
		</>
	);

	if (sentTo) {
		return (
			<AuthLayout
				eyebrow="Reset link sent"
				title="Check your email"
				subtitle={
					<>
						We've sent a password reset link to <strong>{sentTo}</strong>. It expires in 15 minutes.
					</>
				}
				switchLink={backToLogin}
			>
				<Button size="large" block onClick={() => setSentTo(null)}>
					Use a different email
				</Button>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			eyebrow="Account recovery"
			title="Forgot your password?"
			subtitle="Enter your email and we'll send you a link to reset it."
			switchLink={backToLogin}
		>
			<Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
				<Form.Item
					name="email"
					label="Email"
					rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
				>
					<Input size="large" placeholder="you@example.com" autoComplete="email" />
				</Form.Item>
				<Button type="primary" htmlType="submit" size="large" block loading={loading}>
					Send reset link
				</Button>
			</Form>
		</AuthLayout>
	);
};

export default ForgotPassword;
