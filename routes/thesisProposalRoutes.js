const express = require("express");
const router = express.Router();
const {
  listProposalsByUser,
  createProposal,
  updateProposal,
  deleteProposal,
} = require("../controllers/thesisProposalController");
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
  listProposalsByUser
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
 *               title:
 *                 type: string
 *               proposal:
 *                 type: string
 *             required:
 *               - user_id
 *               - proposal
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
  createProposal
);

/**
 * @swagger
 * /api/propuestas/{proposal_id}:
 *   put:
 *     summary: Actualiza una propuesta de tesis
 *     tags: [Propuesta Tesis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposal_id
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
 *               title:
 *                 type: string
 *               proposal:
 *                 type: string
 *             example:  # Añadir un ejemplo correcto aquí
 *               title: "Propuesta de tesis actualizada"
 *               proposal: "Esta es la nueva propuesta de tesis actualizada"
 *     responses:
 *       200:
 *         description: Propuesta actualizada correctamente
 *       404:
 *         description: Propuesta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put(
  "/propuestas/:proposal_id",
  authMiddleware,
  obtenerUserIdDeToken,
  updateProposal
);

/**
 * @swagger
 * /api/propuestas/{proposal_id}:
 *   delete:
 *     summary: Elimina una propuesta de tesis
 *     tags: [Propuesta Tesis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposal_id
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
  "/propuestas/:proposal_id",
  authMiddleware,
  obtenerUserIdDeToken,
  deleteProposal
);

module.exports = router;
