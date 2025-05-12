const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
		},
		profileImage: {
			type: String,
			default: null,
		},
		phone: {
			type: String,
			default: null,
		},
		address: {
			street: String,
			city: String,
			state: String,
			country: String,
			postalCode: String,
		},
		role: {
			type: String,
			enum: ['tenant', 'admin'],
			default: 'tenant',
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
