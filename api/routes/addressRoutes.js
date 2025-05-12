const express = require('express');
const {
	createAddress,
	getAllAddresses,
	getAddressById,
	updateAddress,
	deleteAddress,
} = require('../controllers/addressController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: API for managing property addresses
 */

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Addresses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address created successfully
 *       500:
 *         description: Server error
 */
router.post('/', createAddress);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Retrieve all addresses
 *     tags: [Addresses]
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       500:
 *         description: Server error
 */
router.get('/', getAllAddresses);

/**
 * @swagger
 * /api/addresses/{id}:
 *   get:
 *     summary: Retrieve an address by ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address details
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getAddressById);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address by ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Delete an address by ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteAddress);

module.exports = router;
