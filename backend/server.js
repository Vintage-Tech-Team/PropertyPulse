// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocs } = require('./config/swaggerConfig');
const addressRoutes = require('./routes/addressRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { LOCAL_UPLOAD_DIR, LOCAL_UPLOAD_ROUTE } = require('./utils/s3');

// Initialize App
const app = express();
app.use(express.json());
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optimized CORS for Vercel
app.use(
	cors({
		origin: [
			'http://localhost:3000',
			'http://localhost:4000',
			'https://propertypulse-web.vercel.app',
			'https://propertypulse-admin.vercel.app',
		],
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	}),
);

// Files saved locally when S3 isn't configured (development only)
app.use(LOCAL_UPLOAD_ROUTE, express.static(LOCAL_UPLOAD_DIR));

// Database connection with connection pooling
let cachedDb = null;

async function connectToDatabase() {
	if (cachedDb) {
		return cachedDb;
	}

	try {
		const db = await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 9000,
			maxPoolSize: 10,
			minPoolSize: 5,
			maxIdleTimeMS: 60000,
		});

		cachedDb = db;
		return db;
	} catch (error) {
		console.error('MongoDB connection error:', error);
		throw error;
	}
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
	try {
		if (!mongoose.connection.readyState) {
			await connectToDatabase();
		}
		next();
	} catch (error) {
		next(error);
	}
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', dbState: mongoose.connection.readyState });
});

// Routes with error handling
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/', (req, res) => {
	res.send('Welcome to PropertyPulse API');
});

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
	});
});

// Start server if running locally
if (process.env.NODE_ENV !== 'production') {
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, async () => {
		await connectToDatabase();
		console.log(`Server is running on port ${PORT}`);
	});
}

// Export the app for Vercel
module.exports = app;
