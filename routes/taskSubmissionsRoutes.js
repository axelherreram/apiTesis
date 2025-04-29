const express = require("express");
const router = express.Router();
const {
  getCourseDetails,
  createTaskSubmission,
  getStudentCourseDetails,
  getAllTasksBySedeYearAndUser,
} = require("../controllers/taskSubmissionsController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const validateUser = require("../middlewares/validateUser");

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
router.post(
  "/task-submissions",
  authMiddleware,
  student,
  getUserIdToken,
  validateUser,
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

module.exports = router;
