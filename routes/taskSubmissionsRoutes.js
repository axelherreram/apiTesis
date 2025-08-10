const express = require("express");
const router = express.Router();
const {
  getCourseDetails,
  createTaskSubmission,
  updateTaskSubmission,
  getStudentCourseDetails,
  getAllTasksBySedeYearAndUser,
} = require("../controllers/taskSubmissionsController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const validateUser = require("../middlewares/validateUser");
const { uploadTaskSubmission, handleMulterError } = require("../middlewares/uploadTaskSubmission");
const fs = require("fs");
const path = require("path");

const admin = verifyRole([3, 5]); // Permitir solo a usuarios con rol de administrador
const student = verifyRole([1]); // Permitir solo a usuarios con rol de estudiante
const adminOrStudent = verifyRole([1, 3, 5]); // Permitir solo a usuarios con rol de estudiante o administrador

// Ruta para obtener detalles del curso
/**
 * @swagger
 * /api/courses/{course_id}/{sede_id}/{year}/details:
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
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de la asignación
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
  "/courses/:course_id/:sede_id/:year/details",
  authMiddleware,
  admin,
  getCourseDetails
);

// Ruta para crear una tarea de envío
/**
 * @swagger
 * /api/task-submissions:
 *   post:
 *     summary: Crear una nueva tarea de envío con archivo PDF
 *     tags: [TaskSubmissions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - task_id
 *               - file
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario
 *               task_id:
 *                 type: integer
 *                 description: ID de la tarea
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF de la tarea (máximo 5MB)
 *     responses:
 *       201:
 *         description: Tarea de envío creada exitosamente
 *       400:
 *         description: La tarea de envío ya existe para este usuario y tarea o archivo requerido
 *       404:
 *         description: El usuario o la tarea no existe
 *       500:
 *         description: Error en el servidor al crear la tarea de envío
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/task-submissions",
  authMiddleware,
  student,
  getUserIdToken,
  uploadTaskSubmission.single("file"),
  validateUser,
  handleMulterError,
  createTaskSubmission
);


/**
 * @swagger
 * /api/students/{user_id}/courses/{course_id}/sede/{sede_id}/year/{year}/details:
 *   get:
 *     summary: Obtener detalles del curso de un estudiante, incluyendo sus entregas de tareas
 *     tags: [TaskSubmissions]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estudiante
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
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de la asignación
 *     responses:
 *       200:
 *         description: Detalles del curso del estudiante obtenidos exitosamente
 *       404:
 *         description: No se encontró una asignación válida de curso y sede o el estudiante no está asignado al curso
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/students/:user_id/courses/:course_id/sede/:sede_id/year/:year/details",
  authMiddleware,
  admin,
  getStudentCourseDetails
);

// Nueva ruta para obtener todas las tareas por sede, año y usuario
/**
 * @swagger
 * /api/submissions/student/{user_id}/{year}/{sede_id}:
 *   get:
 *     summary: Obtener todas las tareas por sede, año y verificar si el usuario ya las entregó
 *     tags: [TaskSubmissions]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de la asignación
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede
 *     responses:
 *       200:
 *         description: Tareas obtenidas exitosamente
 *       404:
 *         description: No se encontraron asignaciones de cursos para la sede y el año especificados
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/submissions/student/:user_id/:year/:sede_id",
  authMiddleware,
  adminOrStudent,
  getAllTasksBySedeYearAndUser
);

// Ruta para descargar archivos de tareas
/**
 * @swagger
 * /api/task-submissions/download/{filename}:
 *   get:
 *     summary: Descargar archivo de tarea por nombre de archivo
 *     tags: [TaskSubmissions]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre del archivo a descargar
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *       404:
 *         description: Archivo no encontrado
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/task-submissions/download/:filename",
  authMiddleware,
  adminOrStudent,
  (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads/taskSubmissions", filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: "Archivo no encontrado" });
    }
  }
);

module.exports = router;
