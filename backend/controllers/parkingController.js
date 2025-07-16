const ParkingSpot = require('../models/ParkingSpot');
const Address = require('../models/Address');
const s3Service = require('../utils/s3');
const { calculateDistance } = require('../utils/helper');

// Get all parking spots with filtering, sorting, and pagination
exports.getAllParkingSpots = async (req, res) => {
	try {
		const {
			query,
			isAvailable,
			minPrice,
			maxPrice,
			lat,
			lng,
			radius = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			page = 1,
			limit = 10,
		} = req.query;

		let filter = {};

		// Basic filters
		if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
		if (minPrice) filter.price = { $gte: Number(minPrice) };
		if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

		// Location-based search
		if (lat && lng) {
			filter.location = {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: [Number(lng), Number(lat)],
					},
					$maxDistance: Number(radius) * 1000, // Convert km to meters
				},
			};
		}

		// Text search
		if (query) {
			filter.$or = [{ name: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }];
		}

		const spots = await ParkingSpot.find()
			.populate('address owner')
			.sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
			.skip((page - 1) * limit)
			.limit(Number(limit));
		console.log('🚀 ~ exports.getAllParkingSpots= ~ spots:', spots);

		const total = await ParkingSpot.countDocuments(filter);

		res.json({
			spots,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
		});
	} catch (error) {
		console.error('Error fetching parking spots:', error);
		res.status(500).json({ message: error.message });
	}
};

// Get single parking spot by ID
exports.getParkingSpotById = async (req, res) => {
	try {
		const spot = await ParkingSpot.findById(req.params.id).populate('address owner');

		if (!spot) {
			return res.status(404).json({ message: 'Parking spot not found' });
		}

		res.json(spot);
	} catch (error) {
		console.error('Error fetching parking spot:', error);
		res.status(500).json({ message: error.message });
	}
};

// Create new parking spot
exports.createParkingSpot = async (req, res) => {
	try {
		const imageUrls = [];
		if (req.files) {
			for (const file of req.files) {
				const url = await s3Service.uploadFileToS3(file);
				imageUrls.push(url);
			}
		}

		const parkingSpot = new ParkingSpot({
			...req.body,
			imageUrls,
			owner: req.user.id,
			location: {
				lat: parseFloat(req.body.lat),
				lng: parseFloat(req.body.lng),
			},
		});

		await parkingSpot.save();
		res.status(201).json(parkingSpot);
	} catch (error) {
		console.error('Error creating parking spot:', error);
		res.status(400).json({ message: error.message });
	}
};

// Update parking spot
exports.updateParkingSpot = async (req, res) => {
	try {
		const spot = await ParkingSpot.findById(req.params.id);
		if (!spot) {
			return res.status(404).json({ message: 'Parking spot not found' });
		}

		// Check ownership
		if (spot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized' });
		}

		let imageUrls = [...spot.imageUrls];
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const url = await s3Service.uploadFileToS3(file);
				imageUrls.push(url);
			}
		}

		const updateData = {
			...req.body,
			imageUrls,
			location:
				req.body.lat && req.body.lng
					? {
							lat: parseFloat(req.body.lat),
							lng: parseFloat(req.body.lng),
						}
					: spot.location,
		};

		const updatedSpot = await ParkingSpot.findByIdAndUpdate(req.params.id, updateData, { new: true });

		res.json(updatedSpot);
	} catch (error) {
		console.error('Error updating parking spot:', error);
		res.status(400).json({ message: error.message });
	}
};

// Delete parking spot
exports.deleteParkingSpot = async (req, res) => {
	try {
		const spot = await ParkingSpot.findById(req.params.id);
		if (!spot) {
			return res.status(404).json({ message: 'Parking spot not found' });
		}

		// Check ownership
		if (spot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized' });
		}

		// Delete images from S3
		for (const imageUrl of spot.imageUrls) {
			await s3Service.deleteFileFromS3(imageUrl);
		}

		await spot.remove();
		res.json({ message: 'Parking spot deleted successfully' });
	} catch (error) {
		console.error('Error deleting parking spot:', error);
		res.status(500).json({ message: error.message });
	}
};

// IIFE to add sample parking spots
// (async () => {
// 	try {
// 		console.log('Starting to add sample parking spots...');
// 		const userId = '676932bf4d36028831d0bc72';

// 		// First, get the addresses
// 		const addresses = await Address.find({
// 			city: 'Lahore',
// 			street: { $in: ['Mall Road', 'Liberty Market', 'M.M. Alam Road'] },
// 		});

// 		if (addresses.length === 0) {
// 			console.log('No addresses found. Please run the address creation script first.');
// 			return;
// 		}

// 		const sampleParkingSpots = addresses.map((address) => ({
// 			name: `${address.street} Parking`,
// 			description: `Secure parking space in ${address.societyTown}`,
// 			location: address.location,
// 			price: Math.floor(Math.random() * (500 - 300 + 1)) + 300,
// 			isAvailable: true,
// 			owner: userId,
// 			address: address._id,
// 			imageUrls: ['https://example.com/parking1.jpg', 'https://example.com/parking2.jpg'],
// 		}));

// 		let addedCount = 0;
// 		for (const spot of sampleParkingSpots) {
// 			const existingSpot = await ParkingSpot.findOne({
// 				name: spot.name,
// 				owner: userId,
// 			});

// 			if (!existingSpot) {
// 				const parkingSpot = new ParkingSpot(spot);
// 				await parkingSpot.save();
// 				addedCount++;
// 				console.log(`Created parking spot: ${parkingSpot.name} with ID: ${parkingSpot._id}`);
// 			}
// 		}

// 		console.log(`Added ${addedCount} new parking spots`);
// 	} catch (error) {
// 		console.error('Error adding sample parking spots:', error);
// 	}
// })();

// IIFE to update parking image URLs
// (async () => {
// 	try {
// 		console.log('Starting to update parking image URLs...');

// 		const parkingImages = [
// 			'https://community-search-tool-community-image-assets.s3.amazonaws.com/uploads/1752662086869-stthomas-parking-transportation-lot.jpg',
// 			'https://community-search-tool-community-image-assets.s3.amazonaws.com/uploads/1752662088677-180125-Circontrol-BAIXA-80-1.jpg',
// 			'https://community-search-tool-community-image-assets.s3.amazonaws.com/uploads/1752662091614-photo-1506521781263-d8422e82f27a.jpeg',
// 		];

// 		// Get all parking spots
// 		const parkingSpots = await ParkingSpot.find();
// 		console.log(`Found ${parkingSpots.length} parking spots to update`);

// 		let updatedCount = 0;
// 		for (const spot of parkingSpots) {
// 			try {
// 				// Update each spot with all three images
// 				await ParkingSpot.findByIdAndUpdate(spot._id, { $set: { imageUrls: parkingImages } }, { new: true });
// 				updatedCount++;
// 				console.log(`Updated parking spot: ${spot.name} with new images`);
// 			} catch (error) {
// 				console.error(`Error updating parking spot ${spot._id}:`, error);
// 			}
// 		}

// 		console.log(`Successfully updated ${updatedCount} parking spots with new images`);
// 	} catch (error) {
// 		console.error('Error updating parking image URLs:', error);
// 	}
// })();
