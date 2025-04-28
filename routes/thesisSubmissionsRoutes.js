const express = require("express");
const router = express.Router();
const {
  uploadProposal,
  updateProposal,
} = require("../controllers/thesisSubmissionsController");
const { handleMulterErrors } = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const student = verifyRole([1]); // Permitir solo a usuarios con rol de estudiante
const admin = verifyRole([3]); // Permitir solo a usuarios con rol de administrador

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

/**
 * @swagger
 * /api/thesis-submission/{thesisSubmissions_id}/{user_id}/update:
 *   put:
 *     summary: Actualiza una entrega de tesis
 *     description: Actualiza una entrega de tesis especificada
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               proposal:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF de la propuesta
 *     responses:
 *       200:
 *         description: Entrega de tesis actualizada exitosamente
 *       400:
 *         description: La propuesta ya ha sido aprobada o falta algún campo requerido
 *       404:
 *         description: No se encontró la entrega de tesis o el usuario no existe
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/thesis-submission/:thesisSubmissions_id/:user_id/update",
  authMiddleware, // Middleware de autenticación
  student,        // Middleware de verificación de rol
  updateProposal, // Controlador que actualiza la entrega de tesis
  handleMulterErrors // Middleware para manejar errores de Multer
);


module.exports = router;