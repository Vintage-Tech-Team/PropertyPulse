const express = require('express');
const {
	registerUser,
	loginUser,
	adminLogin,
	forgotPassword,
	resetPassword,
	verifyUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *       required:
 *         - name
 *         - email
 *         - password
 *       example:
 *         name: John Doe
 *         email: john.doe@example.com
 *         password: password123
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
// Register User

router.post('/register', registerUser); // Register a new user

router.get('/verify/:token', verifyUser);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
// Login User
router.post('/login', loginUser); // Log in a user

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login endpoint
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Access denied or invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/admin/login', adminLogin);

// Password recovery routes
router.post('/forgot-password', forgotPassword); // Forgot password
router.post('/reset-password/:token', resetPassword); // Reset password

// Protected admin routes (if needed)
router.get('/admin/check', protect, authorize(['admin']), (req, res) => {
	res.json({ message: 'Valid admin access', user: req.user });
});

module.exports = router;
