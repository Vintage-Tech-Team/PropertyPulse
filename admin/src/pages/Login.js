import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const Login = () => {
	const onFinish = async (values) => {
		try {
			const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/admin/login`, values);
			localStorage.setItem('token', response.data.token);
			message.success('Login successful!');
			window.location.href = '/dashboard';
		} catch (err) {
			message.error('Invalid credentials!');
		}
	};

	return (
		<div style={{ width: 300, margin: '100px auto' }}>
			<Form onFinish={onFinish}>
				<Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
					<Input placeholder="Email" />
				</Form.Item>
				<Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
					<Input.Password placeholder="Password" />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" block>
						Login
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};

export default Login;
