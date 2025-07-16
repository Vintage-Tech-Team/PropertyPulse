const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		location: {
			lat: { type: Number, required: true },
			lng: { type: Number, required: true },
		},
		address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Address',
			required: true,
		},
		imageUrls: [
			{
				type: String,
			},
		],
		price: {
			type: Number,
			required: true,
		},
		isAvailable: {
			type: Boolean,
			default: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);
