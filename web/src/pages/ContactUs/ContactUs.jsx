// pages/ContactUs.jsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { sendContactMessage } from '../../services/contactService';

const ContactUs = () => {
	const [form] = Form.useForm();

	const onFinish = async (values) => {
		try {
			await sendContactMessage(values);
			message.success('Thank you! Your message has been sent.');
			form.resetFields();
		} catch (error) {
			message.error('Failed to send message. Please try again later.');
		}
	};

	return (
		<div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
			<h1>Contact Us</h1>
			<p>Have questions or feedback? We’d love to hear from you.</p>

			<Form form={form} layout="vertical" onFinish={onFinish}>
				<Form.Item label="Your Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
					<Input placeholder="John Doe" />
				</Form.Item>

				<Form.Item
					label="Email"
					name="email"
					rules={[
						{ required: true, message: 'Please enter your email' },
						{ type: 'email', message: 'Invalid email address' },
					]}
				>
					<Input placeholder="you@example.com" />
				</Form.Item>

				<Form.Item
					label="Phone Number"
					name="phone"
					rules={[{ pattern: /^[0-9+\-\s()]*$/, message: 'Invalid phone number' }]}
				>
					<Input placeholder="(Optional) +1 234 567 8901" />
				</Form.Item>

				<Form.Item label="Message" name="message" rules={[{ required: true, message: 'Please enter your message' }]}>
					<Input.TextArea rows={4} placeholder="How can we help you?" />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit">
						Send Message
					</Button>
				</Form.Item>
			</Form>

			<p>
				You can also reach us at: <a href="mailto:support@propertypulse.app">support@propertypulse.app</a>
			</p>
		</div>
	);
};

export default ContactUs;
