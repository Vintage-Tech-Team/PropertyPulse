const User = require('../models/User');
const Property = require('../models/Property');
const s3Service = require('../utils/s3');
const Review = require('../models/Review');
const Address = require('../models/Address');

// Get all users
exports.getAllUsers = async (req, res) => {
	try {
		const {
			query,
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			verified,
			role,
			startDate,
			endDate,
		} = req.query;

		const skip = (page - 1) * limit;

		// Build the search condition
		let searchCondition = {};

		// Add verification filter if provided
		if (verified !== undefined) {
			searchCondition.verified = verified === 'true';
		}

		// Add role filter if provided
		if (role) {
			searchCondition.role = role;
		}

		// Add date range filter if provided
		if (startDate || endDate) {
			searchCondition.createdAt = {};
			if (startDate) {
				searchCondition.createdAt.$gte = new Date(startDate);
			}
			if (endDate) {
				searchCondition.createdAt.$lte = new Date(endDate);
			}
		}

		// Add text search if query provided
		if (query) {
			searchCondition.$or = [
				{ name: { $regex: query, $options: 'i' } },
				{ email: { $regex: query, $options: 'i' } },
				{ phone: { $regex: query, $options: 'i' } },
			];
		}

		// Fetch users with pagination and sorting
		const users = await User.find(searchCondition)
			.sort({ [sortBy]: sortOrder })
			.skip(skip)
			.limit(parseInt(limit))
			.select('-password'); // Exclude password field

		// Get total count for pagination
		const total = await User.countDocuments(searchCondition);

		res.status(200).json({
			users,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			filters: {
				verified,
				role,
				startDate,
				endDate,
				sortBy,
				sortOrder,
			},
		});
	} catch (err) {
		console.error('Error fetching users:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Get a user by ID
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Create a new user
exports.createUser = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		const user = new User({ name, email, password, role });
		await user.save();
		res.status(201).json({ message: 'User created successfully', user });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Update a user
exports.updateUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.status(200).json({ message: 'User updated successfully', user });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Delete a user
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Delete user's profile image if exists
		if (user.profileImage) {
			await s3Service.deleteFileFromS3(user.profileImage);
		}

		// Find all properties created by this user
		const userProperties = await Property.find({ createdBy: user._id });

		// Delete each property and its associated data
		for (const property of userProperties) {
			// Delete property images from S3
			for (const imageUrl of property.imageUrls) {
				await s3Service.deleteFileFromS3(imageUrl);
			}

			// Delete electricity bill image if exists
			if (property.electricityBillImage) {
				await s3Service.deleteFileFromS3(property.electricityBillImage);
			}

			// Delete all reviews associated with this property
			await Review.deleteMany({ property: property._id });

			// Delete the associated address
			await Address.findByIdAndDelete(property.address);

			// Delete the property
			await Property.findByIdAndDelete(property._id);
		}

		// Delete all reviews created by this user
		await Review.deleteMany({ reviewer: user._id });

		// Finally delete the user
		await User.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: 'User and all associated data deleted successfully' });
	} catch (err) {
		console.error('Error deleting user:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Update user profile
exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const { name, phone, address } = req.body;
		const profileImage = req.file;

		// Prepare update object
		const updateData = {
			name,
			phone,
			address,
		};

		// If profile image is uploaded, add it to update data
		if (profileImage) {
			const imageUrl = await s3Service.uploadFileToS3(profileImage);
			updateData.profileImage = imageUrl;
		}

		// Update user profile
		const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select(
			'-password',
		);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json({
			message: 'Profile updated successfully',
			user,
		});
	} catch (err) {
		console.error('Error updating profile:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Update password
exports.updatePassword = async (req, res) => {
	try {
		const userId = req.user.id;
		const { currentPassword, newPassword } = req.body;

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Verify current password
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.status(200).json({ message: 'Password updated successfully' });
	} catch (err) {
		console.error('Error updating password:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Get user profile details
exports.getProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select('-password').populate('address');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Fetch properties added by the user
		const properties = await Property.find({ createdBy: userId }).populate('address');

		// Fetch reviews posted by the user with populated property details
		const reviews = await Review.find({ reviewer: userId })
			.populate({
				path: 'property',
				select: 'name imageUrls address',
				populate: { path: 'address' },
			})
			.select('-consumerId');

		res.status(200).json({
			user,
			properties,
			reviews,
		});
	} catch (err) {
		console.error('Error fetching profile:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
