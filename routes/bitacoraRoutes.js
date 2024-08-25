const express = require('express');
const { listarBitacoraPorUsuario, listarTodasBitacoras } = require('../controllers/bitacoraController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware para verificar el rol de administrador
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Bitácora
 *   description: Operaciones de bitácora
 */

/**
 * @swagger
 * /api/bitacora/{user_id}:
 *   get:
 *     tags: [Bitácora]
 *     summary: Listar las bitácoras de un usuario
 *     description: Obtiene una lista de todas las entradas de la bitácora para un usuario específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario para el que se listarán las bitácoras
 *     responses:
 *       200:
 *         description: Lista de bitácoras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bitacora'
 *       404:
 *         description: No se encontraron entradas de bitácora para este usuario
 *       500:
 *         description: Error en el servidor
 */
router.get('/bitacora/:user_id', authMiddleware, admin, listarBitacoraPorUsuario);

/**
 * @swagger
 * /api/bitacora:
 *   get:
 *     tags: [Bitácora]
 *     summary: Listar todas las bitácoras
 *     description: Obtiene una lista de todas las entradas de la bitácora en el sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para la que se listarán las bitácoras
 *     responses:
 *       200:
 *         description: Lista completa de bitácoras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bitacora'
 *       404:
 *         description: No se encontraron entradas de bitácora
 *       500:
 *         description: Error en el servidor
 */
router.get('/bitacora/:sede_id', authMiddleware, admin, listarTodasBitacoras);

module.exports = router;
