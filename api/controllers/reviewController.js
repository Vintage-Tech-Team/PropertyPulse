const Review = require('../models/Review');
const Property = require('../models/Property');
const s3Service = require('../utils/s3');
const { calculateDuration } = require('../utils/helper');

exports.createReview = async (req, res) => {
	try {
		const {
			property: propertyId,
			reviewer,
			overallRating,
			ratings,
			comment,
			moveInDate,
			moveOutDate,
			consumerId,
		} = req.body;
		const files = req.files;

		// Verify consumer ID matches with property
		const property = await Property.findById(propertyId);
		if (!property) {
			return res.status(404).json({ error: 'Property not found' });
		}

		if (property.consumerId !== consumerId) {
			return res.status(400).json({
				error: 'Consumer ID does not match with property records',
			});
		}

		let mediaUrls = [];

		if (files && files.length > 0) {
			// Upload all files as review media
			for (let file of files) {
				const fileUrl = await s3Service.uploadFileToS3(file);
				mediaUrls.push(fileUrl);
			}
		}

		// Calculate stay duration if both dates are provided
		const stayDuration = moveInDate && moveOutDate ? calculateDuration(moveInDate, moveOutDate) : undefined;

		// Create the review
		const review = new Review({
			property: propertyId,
			reviewer,
			overallRating,
			ratings,
			comment,
			stayDuration,
			moveInDate: moveInDate ? new Date(moveInDate) : undefined,
			moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined,
			media: mediaUrls,
			consumerId,
			status: 'pending', // All reviews start as pending
		});

		await review.save();
		res.status(201).json({ message: 'Review added successfully', review });
	} catch (error) {
		console.error('Error adding review:', error);
		res.status(500).json({ error: 'Failed to add review' });
	}
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
	try {
		const {
			query,
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			status,
			startDate,
			endDate,
			minRating,
			maxRating,
		} = req.query;

		const skip = (page - 1) * limit;

		// Build search conditions
		let searchCondition = {};

		// Add status filter if provided
		if (status) {
			searchCondition.status = status;
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

		// Add rating range filter if provided
		if (minRating || maxRating) {
			searchCondition.overallRating = {};
			if (minRating) {
				searchCondition.overallRating.$gte = Number(minRating);
			}
			if (maxRating) {
				searchCondition.overallRating.$lte = Number(maxRating);
			}
		}

		// Add text search if query provided
		if (query) {
			searchCondition.$or = [
				{ comment: { $regex: query, $options: 'i' } },
				{ consumerId: { $regex: query, $options: 'i' } },
			];
		}

		// Fetch reviews with pagination and sorting
		const reviews = await Review.find(searchCondition)
			.sort({ [sortBy]: sortOrder })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('property reviewer');

		// Get total count for pagination
		const total = await Review.countDocuments(searchCondition);

		res.status(200).json({
			reviews,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			filters: {
				status,
				startDate,
				endDate,
				minRating,
				maxRating,
				sortBy,
				sortOrder,
			},
		});
	} catch (err) {
		console.error('Error fetching reviews:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Update review status to "approved"
exports.approveReview = async (req, res) => {
	try {
		const review = await Review.findByIdAndUpdate(
			req.params.id,
			{ status: 'approved' },
			{ new: true, runValidators: true }, // Ensure validation rules are applied
		);
		if (!review) return res.status(404).json({ message: 'Review not found' });
		res.json({ message: 'Review approved successfully', review });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Update review status to "approved"
exports.flagReview = async (req, res) => {
	try {
		const review = await Review.findByIdAndUpdate(
			req.params.id,
			{ status: 'flagged' },
			{ new: true, runValidators: true }, // Ensure validation rules are applied
		);
		if (!review) return res.status(404).json({ message: 'Review not found' });
		res.json({ message: 'Review flagged successfully', review });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Delete a review
exports.deleteReview = async (req, res) => {
	try {
		const review = await Review.findById(req.params.id);

		if (!review) {
			return res.status(404).json({ message: 'Review not found' });
		}

		// Check if user is review creator or admin
		if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to delete this review' });
		}

		await Review.findByIdAndDelete(req.params.id);
		res.json({ message: 'Review deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.updateReview = async (req, res) => {
	try {
		const review = await Review.findById(req.params.id);

		if (!review) {
			return res.status(404).json({ message: 'Review not found' });
		}

		// Check if user is review creator or admin
		if (review.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to update this review' });
		}

		const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.json({ message: 'Review updated successfully', updatedReview });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
