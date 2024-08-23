const express = require("express");
const router = express.Router();
const {
  listarternas,
  listarTernasActivos,
  actualizarActivoTerna,
} = require("../controllers/ternaController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Ternas
 *   description: Operaciones relacionadas con las ternas
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * /api/ternas:
 *   get:
 *     summary: Listar todas las ternas
 *     description: Obtiene una lista de todos los usuarios con el rol de terna (rol_id = 2) filtrados por sede_id.
 *     tags: [Ternas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sede_id
 *         required: true
 *         description: ID de la sede para filtrar las ternas
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ternas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   fotoPerfil:
 *                     type: string
 *                   activoTerna:
 *                     type: boolean
 *       400:
 *         description: El parámetro sede_id es obligatorio
 *       500:
 *         description: Error al obtener usuarios
 */
router.get("/ternas", authMiddleware, listarternas);

/**
 * @swagger
 * /api/ternas/activos:
 *   get:
 *     summary: Listar todas las ternas activas
 *     description: Obtiene una lista de todos los usuarios con el rol de terna (rol_id = 2) que estén activos, filtrados por sede_id.
 *     tags: [Ternas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sede_id
 *         required: true
 *         description: ID de la sede para filtrar las ternas activas
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ternas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   fotoPerfil:
 *                     type: string
 *       400:
 *         description: El parámetro sede_id es obligatorio
 *       500:
 *         description: Error al obtener usuarios
 */
router.get("/ternas/activos", authMiddleware, listarTernasActivos);

/**
 * @swagger
 * /api/ternas/{user_id}:
 *   put:
 *     summary: Actualizar el estado de terna activa
 *     description: Actualiza el campo activoTerna para un usuario especificado por su ID
 *     tags: [Ternas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID del usuario a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activoTerna:
 *                 type: boolean
 *                 description: Nuevo valor para el campo activoTerna
 *                 example: true
 *     responses:
 *       200:
 *         description: Campo activoTerna actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                     activoTerna:
 *                       type: boolean
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el campo activoTerna
 */
router.put("/ternas/:user_id", authMiddleware, actualizarActivoTerna);

module.exports = router;
