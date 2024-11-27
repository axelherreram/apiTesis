const express = require("express");
const router = express.Router();
const { aprobProposal } = require("../controllers/thesisProposalController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Aprobar tesis
 *   description: Operaciones relacionadas con la aprobación de propuestas de tesis
 */

/**
 * @swagger
 * /api/aprobar-propuesta:
 *   post:
 *     tags: [Aprobar tesis]
 *     summary: Aprueba una propuesta de tesis
 *     description: Aprueba una propuesta específica para un estudiante mediante su ID y el ID de la entrega. Solo una propuesta de 1 a 3 puede ser aprobada.
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
 *                 description: ID del estudiante que presenta la propuesta
 *                 example: 101
 *               submission_id:
 *                 type: integer
 *                 description: ID de la entrega de la propuesta
 *                 example: 202
 *               approved_proposal:
 *                 type: integer
 *                 description: Estado de la aprobación de la propuesta. 
 *                 example: 1
 *     responses:
 *       200:
 *         description: Propuesta actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Propuesta actualizada
 *       400:
 *         description: Error de validación (usuario, entrega o número de propuesta inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Número de propuesta inválido
 *       404:
 *         description: Usuario o entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno al procesar la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al procesar la solicitud
 *                 error:
 *                   type: string
 *                   example: Error interno del servidor
 */

// Ruta para aprobar propuesta
router.post(
  "/aprobar-propuesta",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  aprobProposal
);

module.exports = router;
