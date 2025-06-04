const Query = require('../models/Queries');

exports.createContactMessage = async (req, res) => {
	try {
		const { name, email, message, phone } = req.body;
		if (!name || !email || !message) {
			return res.status(400).json({ error: 'All fields are required.' });
		}
		const query = new Query({ name, email, message, phone });
		await query.save();
		res.status(201).json({ message: 'Message sent successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
};

exports.getAllContactMessages = async (req, res) => {
	try {
		const messages = await Query.find().sort({ createdAt: -1 });
		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
};

exports.getContactMessageById = async (req, res) => {
	try {
		const message = await Query.findById(req.params.id);
		if (!message) return res.status(404).json({ error: 'Message not found.' });
		res.json(message);
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
};

exports.updateContactMessage = async (req, res) => {
	try {
		const { name, email, message, answered } = req.body;
		const updated = await Query.findByIdAndUpdate(req.params.id, { name, email, message, answered }, { new: true });
		if (!updated) return res.status(404).json({ error: 'Message not found.' });
		res.json(updated);
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
};

exports.deleteContactMessage = async (req, res) => {
	try {
		const deleted = await Query.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Message not found.' });
		res.json({ message: 'Message deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
};
