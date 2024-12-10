const express = require("express");
const router = express.Router();
const { updateApprovedProposal, getThesisSubmission } = require("../controllers/thesisProposalController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const admin = verifyRole([3]); // Permitir solo a usuarios con rol de administrador

/**
 * @swagger
 * /api/thesis-submission/{thesisSubmissions_id}/{user_id}/update-approved-proposal:
 *   put:
 *     summary: Actualiza el estado de la propuesta aprobada para una entrega de tesis
 *     description: Actualiza el campo `approved_proposal` de la entrega de tesis especificada
 *     tags:
 *       - Tesis
 *     parameters:
 *       - name: thesisSubmissions_id
 *         in: path
 *         description: ID de la entrega de tesis
 *         required: true
 *         schema:
 *           type: integer
 *       - name: user_id
 *         in: path
 *         description: ID del usuario que realizó la entrega
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved_proposal:
 *                 type: integer
 *                 description: Estado de aprobación de la propuesta (0, 1, 2 o 3)
 *                 enum: [0, 1, 2, 3]
 *     responses:
 *       200:
 *         description: Campo 'approved_proposal' actualizado exitosamente
 *       400:
 *         description: El valor de 'approved_proposal' es incorrecto o la propuesta ya ha sido aprobada
 *       404:
 *         description: No se encontró la entrega de tesis
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/thesis-submission/:thesisSubmissions_id/:user_id/update-approved-proposal",
  authMiddleware, // Middleware de autenticación
  admin,          // Middleware de verificación de rol
  updateApprovedProposal // Controlador que actualiza la propuesta
);

/**
 * @swagger
 * /api/thesis-submission/{user_id}/{task_id}:
 *   get:
 *     summary: Obtener una entrega de tesis
 *     description: Obtiene una entrega de tesis basada en user_id y task_id
 *     tags:
 *       - Tesis
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: ID del usuario que realizó la entrega
 *         required: true
 *         schema:
 *           type: integer
 *       - name: task_id
 *         in: path
 *         description: ID de la tarea
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrega de tesis obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 thesisSubmission:
 *                   $ref: '#/components/schemas/ThesisSubmission'
 *       404:
 *         description: No se encontró la entrega de tesis
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/thesis-submission/:user_id/:task_id",
  authMiddleware, // Middleware de autenticación
  admin,          // Middleware de verificación de rol
  getThesisSubmission // Controlador que obtiene la entrega de tesis
);

module.exports = router;