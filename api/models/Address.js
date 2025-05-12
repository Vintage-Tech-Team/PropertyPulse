const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
	{
		street: {
			type: String,
			required: false,
			trim: true,
		},
		houseNumber: {
			type: String,
			trim: true, // Optional in case house number is not always required
		},
		apartmentNumber: {
			type: String,
			trim: true, // Optional field for apartments
		},
		societyTown: {
			type: String,
			required: true,
			trim: true,
		},
		block: {
			type: String,
			trim: true,
		},
		city: {
			type: String,
			required: true,
			trim: true,
		},
		state: {
			type: String,
			required: true,
			trim: true,
		},
		country: {
			type: String,
			required: true,
			trim: true,
		},
		location: {
			lat: {
				type: Number,
				required: true, // Ensure it's required for geospatial searches
			},
			lng: {
				type: Number,
				required: true,
			},
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Address', AddressSchema);
