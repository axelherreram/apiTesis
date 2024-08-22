const express = require('express');
const router = express.Router();
const { crearAsignacion, listarEstudiantesPorCatedratico } = require('../controllers/asignacionEstudianteController');
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const admin = verifyRole([3]);
const adminOrTerna = verifyRole([2,3]);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/crear:
 *   post:
 *     summary: Crear una asignación
 *     description: Crea una asignación entre un catedrático y un estudiante
 *     security:
 *       - bearerAuth: []   # Requiere autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catedratico_id:
 *                 type: integer
 *                 example: 1
 *               estudiante_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asignación creada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     asignacion_id:
 *                       type: integer
 *                     catedratico_id:
 *                       type: integer
 *                     estudiante_id:
 *                       type: integer
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post('/crear', authMiddleware, obtenerUserIdDeToken, adminOrTerna, crearAsignacion);

/**
 * @swagger
 * /api/estudiantes/{catedratico_id}:
 *   get:
 *     summary: Listar estudiantes asignados a un catedrático
 *     description: Lista todos los estudiantes asignados a un catedrático específico
 *     security:
 *       - bearerAuth: []   # Requiere autenticación
 *     parameters:
 *       - in: path
 *         name: catedratico_id
 *         required: true
 *         description: ID del catedrático
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de estudiantes asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estudiantes asignados
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       email:
 *                         type: string
 *                       carnet:
 *                         type: string
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.get('/estudiantes/:catedratico_id', authMiddleware, obtenerUserIdDeToken, adminOrTerna, listarEstudiantesPorCatedratico);

module.exports = router;
