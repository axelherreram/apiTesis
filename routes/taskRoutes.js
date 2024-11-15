const express = require("express");
const {
  listTasks,
  updateTask,
  listTasksByCourse,
  createTask,
  listInfoTaksByUser,
} = require("../controllers/taskController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const router = express.Router();
const adminOrTerna = verifyRole([2, 3]);
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Task
 *   description: Operaciones relacionadas con las tareas (tasks)
 */

/**
 * @swagger
 * /api/tareas/{sede_id}/{year}:
 *   get:
 *     summary: Lista todas las tareas
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para obtener las tareas
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año para obtener las tareas
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/tareas/:sede_id/:year",
  authMiddleware,
  obtenerUserIdDeToken,
  listTasks
);

/**
 * @swagger
 * /api/tareas/curso/{sede_id}/{course_id}/{year}:
 *   get:
 *     summary: Lista tareas de un curso específico
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año del curso
 *     responses:
 *       200:
 *         description: Lista de tareas del curso especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: No se encontraron tareas
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/tareas/curso/:sede_id/:course_id/:year",
  authMiddleware,
  obtenerUserIdDeToken,
  listTasksByCourse
);

/**
 * @swagger
 * /api/tareas/{task_id}:
 *   put:
 *     summary: Actualiza una tarea específica
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put(
  "/tareas/:task_id",
  authMiddleware,
  obtenerUserIdDeToken,
  adminOrTerna,
  updateTask
);

/**
 * @swagger
 * /api/tareas:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/tareas", authMiddleware, obtenerUserIdDeToken, admin, createTask);

/**
 * @swagger
 * /api/tareas/usuario/{user_id}/{task_id}:
 *   get:
 *     summary: Obtiene información de una tarea y sus entregas
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Información de la tarea y entregas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *                 submissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       submission_id:
 *                         type: integer
 *                       directory:
 *                         type: string
 *                       user_id:
 *                         type: integer
 *                       submission_date:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Usuario o tarea no encontrados
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/tareas/usuario/:user_id/:task_id",
  authMiddleware,
  obtenerUserIdDeToken,
  listInfoTaksByUser
);

module.exports = router;
