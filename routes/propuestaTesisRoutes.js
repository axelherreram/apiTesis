const express = require("express");
const router = express.Router();
const {
  listarPropuestasPorUsuario,
  crearPropuesta,
  actualizarPropuesta,
  eliminarPropuesta,
} = require("../controllers/propuestaTesisController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

// Middleware para verificar el rol de administrador o permisos específicos
// const= verifyRole([2, 3]);

/**
 * @swagger
 * /api/propuestas/{user_id}:
 *   get:
 *     summary: Lista todas las propuestas de un usuario
 *     tags: [Propuesta Tesis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario para listar propuestas
 *     responses:
 *       200:
 *         description: Una lista de propuestas
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/propuestas/:user_id",
  authMiddleware,
  obtenerUserIdDeToken,
  listarPropuestasPorUsuario
);

/**
 * @swagger
 * /api/propuestas:
 *   post:
 *     summary: Crea una nueva propuesta de tesis
 *     tags: [Propuesta Tesis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               propuesta:
 *                 type: string
 *             required:
 *               - user_id
 *               - propuesta
 *     responses:
 *       201:
 *         description: Propuesta creada exitosamente
 *       400:
 *         description: Error de validación o límite de propuestas excedido
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/propuestas",
  authMiddleware,
  obtenerUserIdDeToken,
  crearPropuesta
);

/**
 * @swagger
 * /api/propuestas/{propuesta_id}:
 *   put:
 *     summary: Actualiza una propuesta de tesis
 *     tags: [Propuesta Tesis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propuesta_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propuesta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               propuesta:
 *                 type: string
 *     responses:
 *       200:
 *         description: Propuesta actualizada correctamente
 *       404:
 *         description: Propuesta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put(
  "/propuestas/:propuesta_id",
  authMiddleware,
  obtenerUserIdDeToken,
  actualizarPropuesta
);

/**
 * @swagger
 * /api/propuestas/{propuesta_id}:
 *   delete:
 *     summary: Elimina una propuesta de tesis
 *     tags: [Propuesta Tesis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propuesta_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propuesta a eliminar
 *     responses:
 *       200:
 *         description: Propuesta eliminada correctamente
 *       404:
 *         description: Propuesta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete(
  "/propuestas/:propuesta_id",
  authMiddleware,
  obtenerUserIdDeToken,
  eliminarPropuesta
);

module.exports = router;
