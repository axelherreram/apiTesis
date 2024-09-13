const express = require('express');
const router = express.Router();
const { listGroupTerna, deleteGroupTerna } = require('../controllers/groupTernaController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const obtenerUserIdDeToken = require('../middlewares/obtenerUserIdDeToken');

// Middleware para verificar que el usuario tiene rol de administrador (rol 3)
const admin = verifyRole([3]);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     GroupTerna:
 *       type: object
 *       properties:
 *         groupTerna_id:
 *           type: integer
 *           description: ID del grupo de terna
 *         sede_id:
 *           type: integer
 *           description: ID de la sede
 *         year_id:
 *           type: integer
 *           description: ID del año
 *       required:
 *         - sede_id
 *         - year_id
 *       example:
 *         groupTerna_id: 1
 *         sede_id: 3
 *         year_id: 2023
 *   responses:
 *     UnauthorizedError:
 *       description: No autorizado. El token de autenticación no está presente o es inválido.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: No autorizado. Token no válido o faltante.
 *     NotFoundError:
 *       description: No se encontró el recurso solicitado.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Usuario no encontrado.
 */

/**
 * @swagger
 * tags:
 *   name: GroupTerna
 *   description: API para gestionar los grupos de ternas
 */

/**
 * @swagger
 *  /api/groupTerna:
 *   get:
 *     summary: Listar todos los grupos de ternas filtrados por sede y año.
 *     tags: [GroupTerna]
 *     security:
 *       - bearerAuth: []  # Se requiere autenticación por token
 *     parameters:
 *       - in: query
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede
 *       - in: query
 *         name: year_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del año
 *     responses:
 *       200:
 *         description: Lista de grupos de ternas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupTerna'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error en el servidor.
 */
router.get('/groupTerna', authMiddleware, obtenerUserIdDeToken, admin, listGroupTerna);

/**
 * @swagger
 *  /api/groupTerna/{groupTerna_id}:
 *   delete:
 *     summary: Eliminar un grupo de ternas y sus asignaciones.
 *     tags: [GroupTerna]
 *     security:
 *       - bearerAuth: []  # Se requiere autenticación por token
 *     parameters:
 *       - in: path
 *         name: groupTerna_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del grupo de terna a eliminar.
 *     responses:
 *       200:
 *         description: Terna eliminada exitosamente.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error en el servidor.
 */
router.delete('/groupTerna/:groupTerna_id', authMiddleware, obtenerUserIdDeToken, admin, deleteGroupTerna);

module.exports = router;
