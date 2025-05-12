const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
		},
		owner: {
			type: String,
			required: true,
		},
		address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Address', // Reference the Address model
			required: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		imageUrls: { type: [String] }, // Array of image URLs
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User', // Reference the Address model
			required: true,
		},
		electricityBillImage: {
			type: String,
			required: true,
		},
		consumerId: {
			type: String,
			required: true,
			unique: true, // This already creates an index
			trim: true,
			validate: {
				validator: async function (value) {
					if (this.isNew || this.isModified('consumerId')) {
						const existingProperty = await this.constructor.findOne({ consumerId: value });
						return !existingProperty;
					}
					return true;
				},
				message: (props) =>
					`A property with consumer ID ${props.value} already exists. Please search for the property using this consumer number.`,
			},
		},
	},
	{ timestamps: true },
);

PropertySchema.virtual('averageRating').get(function () {
	if (!this.ratings.length) return 0;
	return this.ratings.reduce((a, b) => a + b, 0) / this.ratings.length;
});

module.exports = mongoose.model('Property', PropertySchema);
