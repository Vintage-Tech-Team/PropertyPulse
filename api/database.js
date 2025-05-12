const mongoose = require('mongoose');

let isConnected = false; // Track connection state

// Connect to Database
const connectToDatabase = async (retries = 5, delay = 5000) => {
	if (isConnected) {
		console.log('Already connected to MongoDB');
		return;
	}

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await mongoose.connect(process.env.MONGODB_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				serverSelectionTimeoutMS: 30000, // Timeout after 20 seconds
				socketTimeoutMS: 60000, // Timeout for socket operations
				maxPoolSize: 10, // Connection pool size
			});
			isConnected = true; // Set the connection state
			console.log('Connected to MongoDB');
			break; // Exit loop on successful connection
		} catch (error) {
			console.error(`Database connection attempt ${attempt} failed: ${error.message}`);
			if (attempt < retries) {
				console.log(`Retrying in ${delay / 1000} seconds...`);
				await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
			} else {
				console.error('All connection attempts failed');
				process.exit(1); // Exit process on failure
			}
		}
	}
};

// MongoDB Event Listeners
mongoose.connection.on('connected', () => {
	console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
	console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
	console.warn('MongoDB connection lost');
});

module.exports = connectToDatabase;
