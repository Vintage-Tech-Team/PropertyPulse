// services/s3.js

const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
	region: process.env.MY_AWS_REGION,
	accessKeyId: process.env.MY_AWS_ACCESS_KEY,
	secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const S3_BUCKET = process.env.MY_AWS_S3_BUCKET;

const uploadFileToS3 = async (file) => {
	const params = {
		Bucket: S3_BUCKET,
		Key: `uploads/${Date.now()}-${file.originalname}`, // Generate unique key
		Body: file.buffer,
		ContentType: file.mimetype,
		ACL: 'public-read', // Make the file publicly accessible
	};

	try {
		const data = await s3.upload(params).promise();
		return data.Location; // Return the public URL of the uploaded file
	} catch (error) {
		console.error('Error uploading file to S3:', error);
		throw error; // Re-throw the error to be handled by the calling function
	}
};

const deleteFileFromS3 = async (fileUrl) => {
	try {
		if (!fileUrl) {
			throw new Error('File URL is required');
		}

		// Extract the key using URL parsing
		const url = new URL(fileUrl);
		const key = decodeURIComponent(url.pathname.split('/').slice(1).join('/'));

		if (!key) {
			throw new Error('Could not extract key from URL');
		}

		const params = {
			Bucket: S3_BUCKET,
			Key: key,
		};

		await s3.deleteObject(params).promise();
		return true;
	} catch (error) {
		console.error('Error deleting file from S3:', error);
		throw error;
	}
};

module.exports = { uploadFileToS3, deleteFileFromS3 };
