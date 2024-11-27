const express = require('express');
const { listarTypeTask } = require('../controllers/typeTaskController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Tipo de tarea
 *   description: Operaciones para recuperar los tipos de tarea
 */

/**
 * @swagger
 * /api/typetasks:
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
 *                 $ref: '#/components/schemas/TypeTask'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error en el servidor
 */
router.get('/typetasks', authMiddleware, admin, listarTypeTask);

module.exports = router;
