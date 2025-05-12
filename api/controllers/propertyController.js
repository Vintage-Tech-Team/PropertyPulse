const Property = require('../models/Property');
const Review = require('../models/Review');
const s3Service = require('../utils/s3'); // S3 service for file uploads
const Address = require('../models/Address');
const { calculateDistance } = require('../utils/helper');
// Add a new property with multiple images
exports.addProperty = async (req, res) => {
	try {
		const { name, location, description, owner, address, createdBy, consumerId } = req.body;
		const files = req.files || {}; // Files is now an object with fields

		// Check for duplicate consumerId
		const existingProperty = await Property.findOne({ consumerId });
		if (existingProperty) {
			return res.status(400).json({
				error: 'A property with this Consumer ID already exists',
				existingPropertyId: existingProperty._id,
			});
		}

		// Upload each file to S3 and collect URLs
		const imageUrls = [];
		let electricityBillImage = '';

		// Handle electricity bill
		if (files.electricityBill && files.electricityBill.length > 0) {
			const billFile = files.electricityBill[0];
			electricityBillImage = await s3Service.uploadFileToS3(billFile);
		}

		// Handle property images
		if (files.files && files.files.length > 0) {
			for (const file of files.files) {
				const fileUrl = await s3Service.uploadFileToS3(file);
				imageUrls.push(fileUrl);
			}
		}

		if (!electricityBillImage) {
			return res.status(400).json({ error: 'Electricity bill image is required' });
		}

		// Create the property with all required fields
		const property = new Property({
			name,
			location,
			description,
			owner,
			address,
			createdBy,
			imageUrls,
			electricityBillImage,
			consumerId,
		});

		await property.save();
		res.status(201).json({ message: 'Property created successfully', property });
	} catch (error) {
		console.error('Error creating property:', error);
		res.status(500).json({ error: 'Failed to create property' });
	}
};

exports.getAllProperties = async (req, res) => {
	try {
		const {
			query,
			page = 1,
			limit = 10,
			latitude,
			longitude,
			radius = 10,
			isAdmin,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			verified,
			startDate,
			endDate,
		} = req.query;

		// Calculate skip for pagination
		const skip = (page - 1) * limit;

		if (isAdmin) {
			// Build admin filter conditions
			let adminSearchCondition = {};

			// Add verification filter if provided
			if (verified !== undefined) {
				adminSearchCondition.verified = verified === 'true';
			}

			// Add date range filter if provided
			if (startDate || endDate) {
				adminSearchCondition.createdAt = {};
				if (startDate) {
					adminSearchCondition.createdAt.$gte = new Date(startDate);
				}
				if (endDate) {
					adminSearchCondition.createdAt.$lte = new Date(endDate);
				}
			}

			// Add text search if query provided
			if (query) {
				adminSearchCondition.$or = [
					{ name: { $regex: query, $options: 'i' } },
					{ owner: { $regex: query, $options: 'i' } },
					{ consumerId: { $regex: query, $options: 'i' } },
				];
			}

			// Fetch properties with admin filters, sorting and pagination
			const properties = await Property.find(adminSearchCondition)
				.sort({ [sortBy]: sortOrder })
				.skip(skip)
				.limit(parseInt(limit))
				.populate('address');

			const total = await Property.countDocuments(adminSearchCondition);

			return res.status(200).json({
				properties,
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				filters: {
					verified,
					startDate,
					endDate,
					sortBy,
					sortOrder,
				},
			});
		}

		let searchCondition = {
			verified: true, // Only include verified properties for non-admin users
		};

		// Define fields to exclude for non-admin users
		const excludeFields = { electricityBillImage: 0, consumerId: 0, verified: 0 };

		if (latitude && longitude) {
			// Step 1: Fetch addresses within the given radius (default 10 km)
			const lat = parseFloat(latitude);
			const lng = parseFloat(longitude);
			const searchRadius = parseFloat(radius);

			// Calculate lat/lng bounds based on radius
			// 0.009 degrees ≈ 1km, so multiply by radius
			const latBound = searchRadius * 0.009;
			const lngBound = searchRadius * 0.009;

			const matchingAddresses = await Address.find({
				'location.lat': { $gte: lat - latBound, $lte: lat + latBound },
				'location.lng': { $gte: lng - lngBound, $lte: lng + lngBound },
			}).then((addresses) => {
				// Filter more precisely using the Haversine formula
				return addresses.filter((address) => {
					const distance = calculateDistance(lat, lng, address.location.lat, address.location.lng);
					return distance <= searchRadius; // Use dynamic radius
				});
			});

			// Step 2: Extract matching Address IDs
			const addressIds = matchingAddresses.map((address) => address._id);

			// Step 3: Filter properties by associated addresses
			searchCondition.address = { $in: addressIds };
		} else if (query) {
			// Step 4: Perform text-based search if no latitude/longitude is provided
			const matchingAddresses = await Address.find({
				$or: [
					{ street: { $regex: query, $options: 'i' } },
					{ block: { $regex: query, $options: 'i' } },
					{ societyTown: { $regex: query, $options: 'i' } },
					{ city: { $regex: query, $options: 'i' } },
					{ state: { $regex: query, $options: 'i' } },
					{ postalCode: { $regex: query, $options: 'i' } },
					{ country: { $regex: query, $options: 'i' } },
				],
			});

			// Extract matching Address IDs
			const addressIds = matchingAddresses.map((address) => address._id);

			// Add text-based search conditions
			searchCondition.$or = [
				{ name: { $regex: query, $options: 'i' } }, // Match by property name
				{ owner: { $regex: query, $options: 'i' } }, // Match by owner
				{ consumerId: { $regex: query, $options: 'i' } }, // Match by consumer ID
				{ address: { $in: addressIds } }, // Match by address reference
			];
		}

		// Fetch properties with pagination and exclude sensitive fields for non-admin users
		const properties = await Property.find(searchCondition, excludeFields)
			.sort({ createdAt: 'desc' }) // Default sort by creation date for non-admin
			.skip(skip)
			.limit(parseInt(limit))
			.populate('address');

		// Add average rating for each property
		const propertiesWithRatings = await Promise.all(
			properties.map(async (property) => {
				// Fetch reviews for the property
				const reviews = await Review.find({ property: property._id, status: 'approved' });
				// Calculate the average rating
				const totalRatings = reviews.reduce((acc, review) => acc + review.overallRating, 0);
				const averageRating = reviews.length ? (totalRatings / reviews.length).toFixed(1) : null;

				return {
					...property.toObject(),
					averageRating,
				};
			}),
		);

		// Total count for matching properties
		const total = await Property.countDocuments(searchCondition);

		res.status(200).json({
			properties: propertiesWithRatings,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
		});
	} catch (err) {
		console.error('Error fetching properties:', err);
		res.status(500).json({ error: 'Failed to fetch properties' });
	}
};

// Get a property by ID with reviews and average rating
exports.getPropertyById = async (req, res) => {
	try {
		const { isProfile, isAdmin } = req.query;
		// Only exclude fields if not viewing profile
		const propertyExcludeFields = isProfile === 'true' || isAdmin === 'true' ? {} : { consumerId: 0, verified: 0 };

		const property = await Property.findById(req.params.id, propertyExcludeFields).populate('address');

		if (!property) return res.status(404).json({ message: 'Property not found' });

		const reviewExcludeFields = { consumerId: 0, status: 0 };

		// Fetch reviews for this property
		const reviews = await Review.find({ property: req.params.id, status: 'approved' }, reviewExcludeFields).populate(
			'reviewer',
			'name',
		);

		// Calculate the average rating
		const totalRatings = reviews.reduce((acc, review) => acc + review.overallRating, 0);
		const averageRating = reviews.length ? (totalRatings / reviews.length).toFixed(1) : null; // Rounded to 1 decimal place

		res.status(200).json({
			...property.toObject(),
			reviews,
			averageRating,
		});
	} catch (err) {
		console.error('Error fetching property details:', err);
		res.status(500).json({ error: 'Failed to fetch property details' });
	}
};

// Update a property
exports.updateProperty = async (req, res) => {
	try {
		const property = await Property.findById(req.params.id);

		if (!property) {
			return res.status(404).json({ message: 'Property not found' });
		}

		// Convert createdBy to string for comparison
		const propertyCreator = property.createdBy.toString();
		const userId = req.user.id.toString(); // Ensure userId is a string for comparison
		const userRole = req.user.role;

		// Allow update if user is either the creator OR an admin
		if (propertyCreator === userId || userRole === 'admin') {
			let imageUrls = [];
			// Parse imageUrls if it's a string
			if (typeof req.body.imageUrls === 'string') {
				try {
					imageUrls = JSON.parse(req.body.imageUrls);
				} catch (e) {
					imageUrls = req.body.imageUrls ? [req.body.imageUrls] : [];
				}
			} else if (Array.isArray(req.body.imageUrls)) {
				imageUrls = req.body.imageUrls;
			}

			const { ...updateData } = req.body;
			const files = req.files || {}; // Files is now an object with fields

			// Handle electricity bill update if provided
			if (files.electricityBill && files.electricityBill.length > 0) {
				const billFile = files.electricityBill[0];
				// Delete old electricity bill from S3
				if (property.electricityBillImage) {
					await s3Service.deleteFileFromS3(property.electricityBillImage);
				}
				// Upload new electricity bill
				updateData.electricityBillImage = await s3Service.uploadFileToS3(billFile);
			}

			// Upload new property images if any
			const newImageUrls = [];
			if (files.files && files.files.length > 0) {
				for (const file of files.files) {
					const fileUrl = await s3Service.uploadFileToS3(file);
					newImageUrls.push(fileUrl);
				}
			}

			// Find removed images by comparing with existing URLs
			const removedImages = property.imageUrls.filter((url) => url && !imageUrls.some((newUrl) => newUrl === url));

			// Delete removed images from S3
			for (const imageUrl of removedImages) {
				await s3Service.deleteFileFromS3(imageUrl);
			}

			// Clean up the image URLs array
			const finalImageUrls = [...imageUrls, ...newImageUrls].filter(
				(url) => url && typeof url === 'string' && url.trim() !== '',
			);

			// Update the property with cleaned image URLs
			updateData.imageUrls = finalImageUrls;

			const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });

			res.json({ message: 'Property updated successfully', property: updatedProperty });
		} else {
			return res.status(403).json({ message: 'Not authorized to update this property' });
		}
	} catch (err) {
		console.error('Error updating property:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// Delete a property
exports.deleteProperty = async (req, res) => {
	try {
		const property = await Property.findById(req.params.id);

		if (!property) {
			return res.status(404).json({ message: 'Property not found' });
		}

		// Check if user is property creator or admin
		if (property.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to delete this property' });
		}

		// Delete all associated images from S3
		for (const imageUrl of property.imageUrls) {
			await s3Service.deleteFileFromS3(imageUrl);
		}

		// Delete electricity bill image if exists
		if (property.electricityBillImage) {
			await s3Service.deleteFileFromS3(property.electricityBillImage);
		}

		// Delete all reviews associated with this property
		await Review.deleteMany({ property: property._id });

		// Delete the associated address
		await Address.findByIdAndDelete(property.address);

		// Finally delete the property
		await Property.findByIdAndDelete(req.params.id);

		res.json({ message: 'Property and all associated data deleted successfully' });
	} catch (err) {
		console.error('Error deleting property:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

// IIFE to add consumerId to properties where it's missing
// (async () => {
// 	try {
// 		console.log('Starting to add missing consumerIds to properties...');

// 		// Find all properties where consumerId is null or undefined
// 		const properties = await Property.find({ consumerId: { $exists: false } });
// 		console.log(`Found ${properties.length} properties without consumerId`);

// 		let updatedCount = 0;

// 		for (const property of properties) {
// 			try {
// 				// Generate a unique consumerId based on property details and timestamp
// 				const timestamp = Date.now();
// 				const randomNum = Math.floor(Math.random() * 10000);
// 				const propertyPrefix = property.name.slice(0, 3).toUpperCase();
// 				const consumerId = `${propertyPrefix}${timestamp}${randomNum}`;

// 				// Update the property with the new consumerId
// 				await Property.findByIdAndUpdate(property._id, {
// 					$set: { consumerId: consumerId },
// 				});

// 				updatedCount++;
// 				console.log(`Added consumerId ${consumerId} to property ${property._id}`);
// 			} catch (error) {
// 				console.error(`Error updating property ${property._id}:`, error);
// 			}
// 		}

// 		console.log(`Update completed. Added consumerId to ${updatedCount} properties`);
// 	} catch (error) {
// 		console.error('Error during property consumerId update:', error);
// 	}
// })();
