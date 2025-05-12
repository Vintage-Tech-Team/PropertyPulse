const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	updateProfile,
	updatePassword,
	getProfile,
} = require('../controllers/userController');

// Admin routes
// Profile routes

router.get('/profile', protect, getProfile);
router.put('/profile/update', protect, upload.single('profileImage'), updateProfile);
router.put('/profile/password', protect, updatePassword);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
