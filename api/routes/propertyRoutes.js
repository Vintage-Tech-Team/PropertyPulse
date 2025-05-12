const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
	addProperty,
	getAllProperties,
	getPropertyById,
	updateProperty,
	deleteProperty,
} = require('../controllers/propertyController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the property
 *         location:
 *           type: string
 *           description: General location of the property
 *         description:
 *           type: string
 *           description: A detailed description of the property
 *         owner:
 *           type: string
 *           description: Name of the property owner
 *         address:
 *           type: string
 *           description: Address ID linked to the property
 *       required:
 *         - name
 *         - location
 *         - owner
 *         - address
 *       example:
 *         name: Cozy Apartment
 *         location: Downtown
 *         description: A beautiful 2-bedroom apartment
 *         owner: John Smith
 *         address: 63faba4df47c4e2d7a0c55aa
 */

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: API for managing properties
 */

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Add a new property with images
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the property
 *               location:
 *                 type: string
 *                 description: Location of the property
 *               description:
 *                 type: string
 *                 description: Description of the property
 *               owner:
 *                 type: string
 *                 description: Name of the property owner
 *               address:
 *                 type: string
 *                 description: Address ID linked to the property
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Property images (up to 9)
 *               electricityBill:
 *                 type: string
 *                 format: binary
 *                 description: Electricity bill image
 *     responses:
 *       201:
 *         description: Property created successfully
 *       500:
 *         description: Server error
 */
router.post(
	'/',
	protect,
	upload.fields([
		{ name: 'files', maxCount: 9 },
		{ name: 'electricityBill', maxCount: 1 },
	]),
	addProperty,
);

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Retrieve all properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       500:
 *         description: Server error
 */
router.get('/', getAllProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Retrieve a property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getPropertyById);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Property images (up to 9)
 *               electricityBill:
 *                 type: string
 *                 format: binary
 *                 description: Electricity bill image
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.put(
	'/:id',
	protect,
	authorize(['admin', 'tenant']),
	upload.fields([
		{ name: 'files', maxCount: 9 },
		{ name: 'electricityBill', maxCount: 1 },
	]),
	updateProperty,
);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorize(['admin']), deleteProperty);

module.exports = router;
