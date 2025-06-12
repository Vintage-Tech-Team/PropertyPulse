const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
	try {
		let token;

		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];

			try {
				const decoded = jwt.verify(token, process.env.MY_JWT_SECRET);
				req.user = decoded;
				next();
			} catch (error) {
				if (error.name === 'TokenExpiredError') {
					return res.status(401).json({
						success: false,
						message: 'Your session has expired. Please login again.',
					});
				}
				throw error;
			}
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized, no token provided',
			});
		}
	} catch (error) {
		res.status(401).json({
			success: false,
			message: 'Not authorized',
			error: error.message,
		});
	}
};

// Middleware for checking role authorization
const authorize = (allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'User not authenticated' });
		}

		// Always allow admin
		if (req.user.role === 'admin') {
			return next();
		}

		// Check if user's role is in the allowed roles
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				message: 'You do not have permission to perform this action',
			});
		}

		next();
	};
};

module.exports = { protect, authorize };
