const express = require('express');
const { listarTypeTask } = require('../controllers/typeTaskController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const adminOrTerna = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Tipo de tarea
 *   description: Recuperar tipo de tarea
 */

/**
 * @swagger
 * /api/typetaks:
 *   get:
 *     summary: Obtener todos los tipos de tarea
 *     description: Obtiene todos los tipos de tarea de la base de datos
 *     tags: [Tipo de tarea]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Una lista de tipos de tarea
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error en el servidor
 */
router.get('/typetaks', authMiddleware, adminOrTerna, listarTypeTask);

module.exports = router;
