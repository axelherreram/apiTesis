const express = require("express");
const router = express.Router();
const {
  uploadProposal,
} = require("../controllers/thesisSubmissionsController");
const { handleMulterErrors } = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const student = verifyRole([1]); // Permitir solo a usuarios con rol de estudiante

/**
 * @swagger
 * /api/thesis/upload:
 *   post:
 *     summary: Subir una propuesta de tesis
 *     description: Permite subir una propuesta de tesis en formato PDF.
 *     tags: [Tesis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               proposal:
 *                 type: string
 *                 format: binary
 *                 description: El archivo PDF de la propuesta de tesis.
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que sube la propuesta.
 *               task_id:
 *                 type: integer
 *                 description: ID de la tarea asociada a la propuesta de tesis.
 *     responses:
 *       201:
 *         description: Propuesta de tesis subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Propuesta de tesis subida exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ThesisSubmission'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al subir el archivo
 *                 error:
 *                   type: string
 *                   example: Detalles del error
 *       404:
 *         description: No se encontró el recurso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El usuario con ID {user_id} no existe
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al guardar la propuesta de tesis en la base de datos
 *                 error:
 *                   type: string
 *                   example: Detalles del error
 */
router.post(
  "/thesis/upload",
  authMiddleware,
  student,
  uploadProposal,
  handleMulterErrors
);

module.exports = router;
