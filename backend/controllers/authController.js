const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');

// Register a new user
exports.registerUser = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'Email already in use' });
		}

		const user = new User({ name, email, password });
		await user.save();

		// Create verification token
		const verificationToken = jwt.sign({ id: user._id }, process.env.MY_JWT_SECRET, { expiresIn: '1d' });
		const verificationLink = `${process.env.BASE_URL}/verify/${verificationToken}`;

		// Send verification email
		await sendEmail(user.email, 'Verify Your Email', `Click to verify your email: ${verificationLink}`);

		res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Verify user's email
exports.verifyUser = async (req, res) => {
	try {
		const { token } = req.params;
		const decoded = jwt.verify(token, process.env.MY_JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (user.verified) {
			return res.status(400).json({ message: 'User already verified' });
		}

		user.verified = true;
		await user.save();

		res.status(200).json({ message: 'Email verified successfully. You can now login.' });
	} catch (err) {
		res.status(400).json({ message: 'Invalid or expired token', error: err.message });
	}
};

// Admin Login
exports.adminLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		// Check if user exists and is an admin
		if (!user || user.role !== 'admin') {
			return res.status(401).json({ message: 'Access denied. Admin only.' });
		}

		// Verify password
		if (!(await user.comparePassword(password))) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		if (!user.verified) {
			return res.status(403).json({ message: 'Please verify your email before logging in' });
		}

		// Create token with admin role
		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
				email: user.email,
				name: user.name,
			},
			process.env.MY_JWT_SECRET,
			{ expiresIn: '1d' },
		);

		// Return admin user data along with token
		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Modify existing loginUser to include role check
exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		// Check credentials
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		if (!user.verified) {
			return res.status(403).json({ message: 'Please verify your email before logging in' });
		}

		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
				email: user.email,
				name: user.name,
			},
			process.env.MY_JWT_SECRET,
			{ expiresIn: '1d' },
		);

		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const token = jwt.sign({ id: user._id }, process.env.MY_JWT_SECRET, { expiresIn: '15m' });

		const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

		await sendEmail(email, 'Reset Your Password', `Click to reset: ${resetLink}`);

		res.status(200).json({ message: 'Password reset link sent to your email' });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const decoded = jwt.verify(token, process.env.MY_JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await User.findByIdAndUpdate(decoded.id, { password: hashedPassword }, { new: true });

		res.status(200).json({ message: 'Password reset successful' });
	} catch (err) {
		res.status(400).json({ message: 'Invalid or expired token', error: err.message });
	}
};
