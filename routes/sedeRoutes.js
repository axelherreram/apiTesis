const express = require('express');
const { listSede, createSede } = require('../controllers/sedeController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const obtenerUserIdDeToken = require('../middlewares/obtenerUserIdDeToken');

const router = express.Router();
const adminOrTerna = verifyRole([2, 3]);
const superAdmin = verifyRole([4]);

/**
 * @swagger
 * tags:
 *   name: Sede
 *   description: Gestión de sedes - operaciones para listar y crear sedes dentro del sistema.
 */

/**
 * @swagger
 * /api/sedes:
 *   get:
 *     summary: Lista todas las sedes
 *     tags: [Sede]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las sedes disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sede'
 *       500:
 *         description: Error interno del servidor al intentar recuperar las sedes.
 *   post:
 *     summary: Crea una nueva sede
 *     tags: [Sede]
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
 *         description: Sede creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sede'
 *       400:
 *         description: Datos de entrada inválidos. Se requiere el nombre de la sede.
 *       500:
 *         description: Error interno del servidor al intentar crear la sede.
 */

router.get('/sedes', authMiddleware, listSede);
router.post('/sedes', authMiddleware, obtenerUserIdDeToken, superAdmin, createSede);

module.exports = router;
