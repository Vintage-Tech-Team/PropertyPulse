const Address = require('../models/Address');
const Property = require('../models/Property');

// Create a new address
exports.createAddress = async (req, res) => {
	try {
		const address = new Address(req.body);
		await address.save();
		res.status(201).json({ message: 'Address created successfully', address });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

exports.getAllAddresses = async (req, res) => {
	try {
		const {
			query,
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			city,
			state,
			country,
			startDate,
			endDate,
		} = req.query;

		const skip = (page - 1) * limit;

		// Build search conditions
		let searchCondition = {};

		// Add location filters if provided
		if (city) {
			searchCondition.city = { $regex: city, $options: 'i' };
		}
		if (state) {
			searchCondition.state = { $regex: state, $options: 'i' };
		}
		if (country) {
			searchCondition.country = { $regex: country, $options: 'i' };
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
				{ street: { $regex: query, $options: 'i' } },
				{ block: { $regex: query, $options: 'i' } },
				{ societyTown: { $regex: query, $options: 'i' } },
				{ city: { $regex: query, $options: 'i' } },
				{ state: { $regex: query, $options: 'i' } },
				{ country: { $regex: query, $options: 'i' } },
				{ postalCode: { $regex: query, $options: 'i' } },
			];
		}

		// Fetch addresses with pagination and sorting
		const addresses = await Address.find(searchCondition)
			.sort({ [sortBy]: sortOrder })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
		const total = await Address.countDocuments(searchCondition);

		res.status(200).json({
			addresses,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			filters: {
				city,
				state,
				country,
				startDate,
				endDate,
				sortBy,
				sortOrder,
			},
		});
	} catch (err) {
		console.error('Error fetching addresses:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Get an address by ID
exports.getAddressById = async (req, res) => {
	try {
		const address = await Address.findById(req.params.id);
		if (!address) return res.status(404).json({ message: 'Address not found' });
		res.json(address);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Update an address
exports.updateAddress = async (req, res) => {
	try {
		const address = await Address.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true, runValidators: true },
		);
		if (!address) return res.status(404).json({ message: 'Address not found' });
		res.json({ message: 'Address updated successfully', address });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Delete an address
exports.deleteAddress = async (req, res) => {
	try {
		// First check if address exists
		const address = await Address.findById(req.params.id);
		if (!address) {
			return res.status(404).json({ message: 'Address not found' });
		}

		// Check if any property is using this address
		const associatedProperty = await Property.findOne({ address: req.params.id });
		if (associatedProperty) {
			return res.status(400).json({
				message: 'Cannot delete address as it is associated with a property',
				propertyId: associatedProperty._id,
			});
		}

		// If no property is using this address, proceed with deletion
		await Address.findByIdAndDelete(req.params.id);
		res.json({ message: 'Address deleted successfully' });
	} catch (err) {
		console.error('Error deleting address:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// IIFE to add createdAt dates to addresses
// (async () => {
// 	try {
// 		console.log('Starting to update addresses with creation dates...');

// 		// Find all addresses and sort by _id to get creation order
// 		// Since ObjectId contains timestamp, we can use it as a reference
// 		const addresses = await Address.find().sort({ _id: 1 });
// 		console.log(`Found ${addresses.length} addresses to process`);

// 		let updatedCount = 0;

// 		for (const address of addresses) {
// 			try {
// 				// Extract timestamp from ObjectId (first 4 bytes contain seconds since epoch)
// 				const timestampFromId = Math.floor(parseInt(address._id.toString().substring(0, 8), 16) * 1000);
// 				const objectIdDate = new Date(timestampFromId);

// 				// Set a date between ObjectId creation time and now
// 				const now = new Date().getTime();
// 				const minDate = Math.max(objectIdDate.getTime(), new Date('2023-01-01').getTime());
// 				const randomDate = new Date(minDate + Math.random() * (now - minDate));

// 				// Find associated property
// 				const property = await Property.findOne({ address: address._id });

// 				// If property exists, ensure address date is before property creation
// 				const finalDate = property
// 					? new Date(Math.min(randomDate.getTime(), new Date(property.createdAt).getTime() - 24 * 60 * 60 * 1000))
// 					: randomDate;

// 				// Update only the createdAt field using direct MongoDB operation
// 				// This bypasses Mongoose's automatic updatedAt handling
// 				await Address.collection.updateOne({ _id: address._id }, { $set: { createdAt: finalDate } });

// 				updatedCount++;
// 				console.log(`Updated address ${address._id} with creation date ${finalDate}`);
// 			} catch (error) {
// 				console.error(`Error updating address ${address._id}:`, error);
// 			}
// 		}

// 		console.log(`Update completed. Added creation dates to ${updatedCount} addresses`);
// 	} catch (error) {
// 		console.error('Error during address dates update:', error);
// 	}
// })();
