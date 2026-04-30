const express = require('express');
const { listSede, createSede, editSede } = require('../controllers/sedeController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const getUserIdToken = require('../middlewares/getUserIdToken');

const router = express.Router();
const superAdmin = verifyRole([5]);

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Location (sede) management - list, create and edit locations.
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: List all locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all available locations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sede'
 *       500:
 *         description: Internal server error.
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sede'
 *     responses:
 *       201:
 *         description: Location created successfully.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/locations/{sede_id}:
 *   put:
 *     summary: Edit a location's name and address
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameSede:
 *                 type: string
 *                 example: "New Location Name"
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *     responses:
 *       200:
 *         description: Location updated successfully.
 *       400:
 *         description: Location name is required.
 *       404:
 *         description: Location not found.
 *       500:
 *         description: Error updating location.
 */

router.get('/locations', authMiddleware, listSede);
router.post('/locations', authMiddleware, getUserIdToken, superAdmin, createSede);
router.put('/locations/:sede_id', authMiddleware, getUserIdToken, superAdmin, editSede);

module.exports = router;