const express = require("express");
const router = express.Router();
const {
  getCourseDetails,
  createTaskSubmission,
} = require("../controllers/taskSubmissionsController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const admin = verifyRole([3]); // Permitir solo a usuarios con rol de administrador
const student = verifyRole([1]); // Permitir solo a usuarios con rol de estudiante

// Ruta para obtener detalles del curso
/**
 * @swagger
 * /api/courses/{course_id}/{sede_id}/details:
 *   get:
 *     summary: Obtener detalles del curso, incluyendo estudiantes y sus entregas de tareas
 *     tags: [TaskSubmissions]
 *     parameters:
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede
 *     responses:
 *       200:
 *         description: Detalles del curso obtenidos exitosamente
 *       404:
 *         description: No se encontró una asignación válida de curso y sede
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/courses/:course_id/:sede_id/details",
  authMiddleware,
  admin,
  getCourseDetails
);

// Ruta para crear una tarea de envío
/**
 * @swagger
 * /api/task-submissions:
 *   post:
 *     summary: Crear una nueva tarea de envío
 *     tags: [TaskSubmissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario
 *               task_id:
 *                 type: integer
 *                 description: ID de la tarea
 *     responses:
 *       201:
 *         description: Tarea de envío creada exitosamente
 *       400:
 *         description: La tarea de envío ya existe para este usuario y tarea
 *       404:
 *         description: El usuario o la tarea no existe
 *       500:
 *         description: Error en el servidor al crear la tarea de envío
 *     security:
 *       - bearerAuth: []
 */
router.post("/task-submissions", authMiddleware, student, createTaskSubmission);

module.exports = router;
