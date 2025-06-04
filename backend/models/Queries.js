const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		phone: { type: String, required: false }, // optional field
		message: { type: String, required: true },
		answered: { type: Boolean, default: false }, // added field
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Query', QuerySchema);
