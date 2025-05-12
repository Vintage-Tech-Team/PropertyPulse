const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
	{
		property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Property',
			required: true,
		},
		reviewer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		overallRating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		ratings: {
			cleanliness: { type: Number, min: 1, max: 5, default: 0 },
			communication: { type: Number, min: 1, max: 5, default: 0 },
			location: { type: Number, min: 1, max: 5, default: 0 },
			valueForMoney: { type: Number, min: 1, max: 5, default: 0 },
		},
		comment: {
			type: String,
			trim: true,
		},
		media: [
			{
				type: String, // URLs to images/videos
			},
		],
		stayDuration: {
			type: String, // Example: '6 months'
		},
		moveInDate: {
			type: Date,
		},
		moveOutDate: {
			type: Date,
		},
		reported: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'flagged'],
			default: 'pending',
		},
		consumerId: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Review', ReviewSchema);
