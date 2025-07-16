const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
	getAllParkingSpots,
	getParkingSpotById,
	createParkingSpot,
	updateParkingSpot,
	deleteParkingSpot,
} = require('../controllers/parkingController');

// Get all parking spots with filters
router.get('/', getAllParkingSpots);

// Create new parking spot
router.post('/', protect, authorize('admin', 'owner'), upload.array('images', 5), createParkingSpot);

// Update parking spot
router.put('/:id', protect, authorize('admin', 'owner'), upload.array('images', 5), updateParkingSpot);

// Delete parking spot
router.delete('/:id', protect, authorize('admin', 'owner'), deleteParkingSpot);

// Get single parking spot
router.get('/:id', getParkingSpotById);

module.exports = router;
