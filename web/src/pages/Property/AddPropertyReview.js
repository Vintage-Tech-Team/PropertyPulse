import React from 'react';
import { Button, Col, Form, Input, DatePicker, Rate, Row, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { addReview } from '../../services/reviewService';
import { getUserIdFromToken } from '../../utils/token';

const { TextArea } = Input;

const AddPropertyReview = ({ propertyId, onSuccess, onCancel, isSubmitting, setIsSubmitting }) => {
	const [form] = Form.useForm();

	const validateNonEmpty = (rule, value) => {
		if (!value || !value.trim()) {
			return Promise.reject('This field cannot be empty or contain only whitespace');
		}
		if (value.trim() !== value) {
			return Promise.reject('This field cannot start or end with whitespace');
		}
		return Promise.resolve();
	};

	const onSubmit = async (values) => {
		try {
			setIsSubmitting(true);
			const formData = new FormData();
			const userId = getUserIdFromToken();

			formData.append('property', propertyId);
			formData.append('reviewer', userId);
			formData.append('ratings', JSON.stringify(values.ratings));
			formData.append('overallRating', values.overallRating);
			formData.append('comment', values.comment);
			formData.append('moveInDate', values.moveInDate.format('YYYY-MM-DD'));
			formData.append('moveOutDate', values.moveOutDate.format('YYYY-MM-DD'));
			formData.append('consumerId', values.consumerId);

			const images = values.images || [];
			if (images.length < 1) {
				message.error('Please upload at least one review image');
				setIsSubmitting(false);
				return;
			}

			images.forEach((image) => {
				if (image.originFileObj) {
					formData.append('images', image.originFileObj);
				}
			});

			await addReview(formData);
			message.success('Review submitted for verification!');
			form.resetFields();
			onSuccess();
		} catch (err) {
			if (err.message === 'Consumer ID verification failed') {
				message.error('The Consumer ID does not match with property records');
			} else {
				message.error('Failed to add review');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form form={form} onFinish={onSubmit} layout="vertical" style={{ paddingBottom: '24px' }}>
			{/* Electricity Bill and Consumer ID */}
			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Form.Item
						name="consumerId"
						label="Consumer ID"
						tooltip="Enter the electricity consumer ID from your bill for verification"
						rules={[
							{ required: true, message: 'Consumer ID is required' },
							{ pattern: /^[0-9]{8,}$/, message: 'Please enter a valid consumer ID (minimum 8 digits)' },
						]}
					>
						<Input placeholder="Enter Consumer ID from your electricity bill" />
					</Form.Item>
				</Col>
			</Row>

			{/* Ratings Section */}
			<Row gutter={[16, 0]}>
				<Col span={8}>
					<Form.Item
						name={['ratings', 'cleanliness']}
						label="Cleanliness"
						rules={[{ required: true, message: 'Required' }]}
					>
						<Rate />
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item
						name={['ratings', 'communication']}
						label="Communication"
						rules={[{ required: true, message: 'Required' }]}
					>
						<Rate />
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item name={['ratings', 'location']} label="Location" rules={[{ required: true, message: 'Required' }]}>
						<Rate />
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={[16, 0]} justify="center">
				<Col span={8}>
					<Form.Item
						name={['ratings', 'valueForMoney']}
						label="Value for Money"
						rules={[{ required: true, message: 'Required' }]}
					>
						<Rate />
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item
						name="overallRating"
						label="Overall Rating"
						tooltip="Your overall experience"
						rules={[{ required: true, message: 'Required' }]}
					>
						<Rate />
					</Form.Item>
				</Col>
			</Row>

			{/* Comment section */}
			<Form.Item
				name="comment"
				label="Comment"
				tooltip="10-500 characters"
				rules={[
					{ required: true, message: 'Required' },
					{ validator: validateNonEmpty },
					{ min: 3, message: 'Min 3 characters' },
					{ max: 500, message: 'Max 500 characters' },
				]}
			>
				<TextArea rows={3} maxLength={500} showCount />
			</Form.Item>

			{/* Stay Details */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} sm={12}>
					<Form.Item name="moveInDate" label="Move-In" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
						<DatePicker
							style={{ width: '100%' }}
							disabledDate={(current) => {
								const moveOutDate = form.getFieldValue('moveOutDate');
								return moveOutDate && current > moveOutDate;
							}}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item name="moveOutDate" label="Move-Out" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
						<DatePicker
							style={{ width: '100%' }}
							disabledDate={(current) => {
								const moveInDate = form.getFieldValue('moveInDate');
								return (moveInDate && current < moveInDate) || current > new Date();
							}}
						/>
					</Form.Item>
				</Col>
			</Row>

			{/* Images Upload */}
			<Form.Item
				name="images"
				label="Upload Images"
				tooltip="Upload at least 2 images to support your review (max 5MB per image)"
				valuePropName="fileList"
				getValueFromEvent={(e) => e?.fileList}
				rules={[
					{
						validator: (_, fileList) =>
							fileList?.length >= 2
								? Promise.resolve()
								: Promise.reject(new Error('Please upload at least 2 images of the property.')),
					},
				]}
			>
				<Upload
					listType="picture-card"
					multiple
					beforeUpload={(file) => {
						const isImage = file.type.startsWith('image/');
						if (!isImage) {
							message.error('You can only upload image files!');
						}
						const isLt5M = file.size / 1024 / 1024 < 5;
						if (!isLt5M) {
							message.error('Image must be smaller than 5MB!');
						}
						return false;
					}}
					onPreview={async (file) => {
						const src = file.url || URL.createObjectURL(file.originFileObj);
						const imgWindow = window.open(src);
						imgWindow.document.write(`<img src="${src}" />`);
					}}
				>
					<div>
						<PlusOutlined />
						<div style={{ marginTop: 8 }}>Upload</div>
					</div>
				</Upload>
			</Form.Item>

			<Row justify="end" gutter={[16, 0]}>
				<Col>
					<Button onClick={onCancel} disabled={isSubmitting}>
						Cancel
					</Button>
				</Col>
				<Col>
					<Button type="primary" htmlType="submit" loading={isSubmitting}>
						Submit Review
					</Button>
				</Col>
			</Row>
		</Form>
	);
};

export default AddPropertyReview;
