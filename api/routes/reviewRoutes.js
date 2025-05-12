const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
	createReview,
	getAllReviews,
	deleteReview,
	approveReview,
	flagReview,
} = require('../controllers/reviewController');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API for managing property reviews
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Add a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       500:
 *         description: Server error
 */
router.post('/', protect, upload.array('files', 10), createReview);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Retrieve all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Server error
 */
router.get('/', getAllReviews);

/**
 * @swagger
 * /api/reviews/{id}/approve:
 *   patch:
 *     summary: Approve a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review approved successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/approve', protect, authorize(['admin']), approveReview);

router.patch('/:id/flag', protect, authorize(['admin']), flagReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorize(['admin']), deleteReview);

module.exports = router;
