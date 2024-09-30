const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadPdf");
const {
  createSubmission,
  listSubmissions,
  deleteSubmissions,
  updateSubmission,
} = require("../controllers/submissionsController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const adminTernastudent = verifyRole([1, 2, 3]);
const student = verifyRole([1]);

/**
 * @swagger
 * /api/submit/task:
 *   post:
 *     summary: Sube un archivo PDF para la submisión de una tarea
 *     tags:
 *       - Submisiones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: ID de la tarea
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que realiza la submisión
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: El archivo PDF que se va a subir
 *     responses:
 *       201:
 *         description: Submisión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entrega realizada exitosamente"
 *                 submission:
 *                   type: object
 *                   properties:
 *                     submission_id:
 *                       type: integer
 *                       example: 1
 *                     directory:
 *                       type: string
 *                       example: "uploads/submissions/1234567890-nombrearchivo.pdf"
 *                     task_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     submission_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-26T14:48:00.000Z"
 *       400:
 *         description: Error en la solicitud (por ejemplo, archivo no subido o formato incorrecto)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se ha subido ningún archivo"
 *       404:
 *         description: Tarea o Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarea no encontrada"
 */

/**
 * @swagger
 * /api/submit/task/{user_id}/{task_id}:
 *   get:
 *     summary: Obtiene las submisiones de una tarea para un usuario específico
 *     tags:
 *       - Submisiones
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *       - in: path
 *         name: task_id
 *         required: true
 *         description: ID de la tarea
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Listado de submisiones para la tarea y usuario especificados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   submission_id:
 *                     type: integer
 *                     example: 1
 *                   directory:
 *                     type: string
 *                     example: "uploads/submissions/1234567890-nombrearchivo.pdf"
 *                   task_id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   submission_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-09-26T14:48:00.000Z"
 *       500:
 *         description: Error al obtener las submisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener las entregas"
 */

/**
 * @swagger
 * /api/submit/task/{submission_id}:
 *   delete:
 *     summary: Elimina una entrega y su archivo correspondiente
 *     tags:
 *       - Submisiones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submission_id
 *         required: true
 *         description: ID de la entrega a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrega eliminada exitosamente junto con su archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entrega eliminada exitosamente junto con su archivo"
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entrega no encontrada"
 *       500:
 *         description: Error al eliminar la entrega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al eliminar la entrega"
 */

/**
 * @swagger
 * /api/submit/task/{submission_id}:
 *   put:
 *     summary: Actualiza una entrega y reemplaza el archivo anterior
 *     tags:
 *       - Submisiones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submission_id
 *         required: true
 *         description: ID de la entrega a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: El archivo PDF que reemplazará al anterior
 *     responses:
 *       200:
 *         description: Entrega actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entrega actualizada exitosamente"
 *                 submission:
 *                   type: object
 *                   properties:
 *                     submission_id:
 *                       type: integer
 *                       example: 1
 *                     directory:
 *                       type: string
 *                       example: "uploads/submissions/1234567890-nombrearchivo.pdf"
 *                     task_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     submission_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-26T14:48:00.000Z"
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Entrega no encontrada"
 *       500:
 *         description: Error al actualizar la entrega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al actualizar la entrega"
 */

router.post(
  "/submit/task",
  authMiddleware,           
  obtenerUserIdDeToken,      
  student,                  
  upload.single("file"),    
  createSubmission            
);
router.get(
  "/submit/task/:user_id/:task_id",
  authMiddleware,
  obtenerUserIdDeToken,
  adminTernastudent,
  listSubmissions
);
router.delete(
  "/submit/task/:submission_id",
  authMiddleware,
  obtenerUserIdDeToken,
  student,
  deleteSubmissions
);
router.put(
  "/submit/task/:submission_id",
  authMiddleware,
  obtenerUserIdDeToken,
  student,
  upload.single("file"),
  updateSubmission
);

module.exports = router;
