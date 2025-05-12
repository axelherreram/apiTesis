const express = require('express');
const { listarRoles } = require('../controllers/rolController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const adminOrTerna = verifyRole([3, 5]);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Operaciones relacionadas con los roles
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     description: Obtiene todos los roles de la base de datos
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Una lista de roles
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
router.get('/roles', authMiddleware, adminOrTerna, listarRoles);

module.exports = router;
