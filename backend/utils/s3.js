// services/s3.js
//
// Uploads go to S3. When S3 isn't configured outside production (e.g. local
// development without AWS keys), files are written to backend/uploads instead
// and served by server.js at /uploads.

const fs = require('fs/promises');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
	region: process.env.MY_AWS_REGION,
	accessKeyId: process.env.MY_AWS_ACCESS_KEY,
	secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const S3_BUCKET = process.env.MY_AWS_S3_BUCKET;

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const LOCAL_UPLOAD_ROUTE = '/uploads';

const isS3Configured = () =>
	Boolean(S3_BUCKET && process.env.MY_AWS_ACCESS_KEY && process.env.MY_AWS_SECRET_ACCESS_KEY);

const useLocalStorage = () => !isS3Configured() && process.env.NODE_ENV !== 'production';

// Public origin of this API, used to build URLs for locally stored files.
const localPublicUrl = () => process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;

const safeName = (name = 'file') => path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');

const saveFileLocally = async (file) => {
	await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
	const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName(file.originalname)}`;
	await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, fileName), file.buffer);
	return `${localPublicUrl()}${LOCAL_UPLOAD_ROUTE}/${fileName}`;
};

// Returns the file name if the URL points at a locally stored upload.
const localFileName = (fileUrl) => {
	try {
		const url = new URL(fileUrl);
		if (!url.pathname.startsWith(`${LOCAL_UPLOAD_ROUTE}/`)) return null;
		if (url.origin !== new URL(localPublicUrl()).origin) return null;
		return path.basename(decodeURIComponent(url.pathname));
	} catch {
		return null;
	}
};

const uploadFileToS3 = async (file) => {
	if (useLocalStorage()) {
		return saveFileLocally(file);
	}

	if (!isS3Configured()) {
		const error = new Error('File storage is not configured: set MY_AWS_S3_BUCKET and the AWS keys');
		error.code = 'S3_NOT_CONFIGURED';
		throw error;
	}

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

		const localName = localFileName(fileUrl);
		if (localName) {
			await fs.rm(path.join(LOCAL_UPLOAD_DIR, localName), { force: true });
			return true;
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

module.exports = { uploadFileToS3, deleteFileFromS3, LOCAL_UPLOAD_DIR, LOCAL_UPLOAD_ROUTE };
