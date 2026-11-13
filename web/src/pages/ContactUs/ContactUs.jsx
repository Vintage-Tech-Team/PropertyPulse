// pages/ContactUs.jsx
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { sendContactMessage } from '../../services/contactService';
import styles from './ContactUs.module.css';

const MailIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
		<rect x="3" y="5" width="18" height="14" rx="2" />
		<path d="m4 7 8 6 8-6" strokeLinecap="round" />
	</svg>
);

const ScaleIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M12 4v16M7 20h10M5 8h14" />
		<path d="m5 8-3 6a3 3 0 0 0 6 0L5 8ZM19 8l-3 6a3 3 0 0 0 6 0l-3-6Z" />
	</svg>
);

const CheckIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</svg>
);

const ContactUs = () => {
	const [form] = Form.useForm();
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);

	const onFinish = async (values) => {
		setSending(true);
		try {
			await sendContactMessage(values);
			message.success('Thank you! Your message has been sent.');
			form.resetFields();
			setSent(true);
		} catch (error) {
			message.error('Failed to send message. Please try again later.');
		} finally {
			setSending(false);
		}
	};

	return (
		<div className={styles.page}>
			<section>
				<p className={styles.eyebrow}>Contact</p>
				<h1 className={styles.title}>We’d love to hear from you.</h1>
				<p className={styles.lead}>
					Have questions or feedback, spotted a listing that looks wrong, or need help with your account? Send us a
					message and we’ll get back to you.
				</p>
				<div className={styles.channels}>
					<a className={styles.channel} href="mailto:support@propertypulse.app">
						<span className={styles.channelIcon}>
							<MailIcon />
						</span>
						<span>
							<span className={styles.channelLabel}>Support and feedback</span>
							<span className={styles.channelValue}>support@propertypulse.app</span>
						</span>
					</a>
					<a className={styles.channel} href="mailto:legal@propertypulse.app">
						<span className={styles.channelIcon}>
							<ScaleIcon />
						</span>
						<span>
							<span className={styles.channelLabel}>Legal and privacy requests</span>
							<span className={styles.channelValue}>legal@propertypulse.app</span>
						</span>
					</a>
				</div>
			</section>

			<section className={styles.formCard}>
				{sent ? (
					<div className={styles.sent}>
						<span className={styles.sentIcon}>
							<CheckIcon />
						</span>
						<h2 className={styles.formTitle}>Message sent</h2>
						<p className={styles.sentText}>Thanks for reaching out. We’ve received your message and will reply by email.</p>
						<Button size="large" onClick={() => setSent(false)}>
							Send another message
						</Button>
					</div>
				) : (
					<>
						<h2 className={styles.formTitle}>Send a message</h2>
						<p className={styles.formHint}>All fields except phone are required.</p>
						<Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
							<div className={styles.row}>
								<Form.Item label="Your name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
									<Input size="large" placeholder="Ayesha Khan" autoComplete="name" />
								</Form.Item>

								<Form.Item
									label="Phone number"
									name="phone"
									rules={[{ pattern: /^[0-9+\-\s()]*$/, message: 'Invalid phone number' }]}
								>
									<Input size="large" placeholder="Optional, e.g. +92 300 1234567" autoComplete="tel" />
								</Form.Item>
							</div>

							<Form.Item
								label="Email"
								name="email"
								rules={[
									{ required: true, message: 'Please enter your email' },
									{ type: 'email', message: 'Invalid email address' },
								]}
							>
								<Input size="large" placeholder="you@example.com" autoComplete="email" />
							</Form.Item>

							<Form.Item label="Message" name="message" rules={[{ required: true, message: 'Please enter your message' }]}>
								<Input.TextArea rows={5} placeholder="How can we help you?" />
							</Form.Item>

							<Button type="primary" htmlType="submit" size="large" block loading={sending}>
								Send message
							</Button>
						</Form>
					</>
				)}
			</section>
		</div>
	);
};

export default ContactUs;
