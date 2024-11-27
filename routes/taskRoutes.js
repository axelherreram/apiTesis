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
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nueva tarea de desarrollo
 *               description:
 *                 type: string
 *                 example: Descripción actualizada de la tarea
 *               taskStart:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-11-27T09:00:00Z
 *               endTask:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-11-28T17:00:00Z
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: 09:00:00
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: 17:00:00
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
  admin,
  extractSedeIdMiddleware,
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
 *           example:
 *             course_id: 1
 *             sede_id: 1
 *             typeTask_id: 1
 *             title: "CAPÍTULO 3"
 *             description: "Completar el capítulo 3 del proyecto de investigación"
 *             taskStart: "2024-09-15T08:00:00Z"
 *             endTask: "2024-09-20T12:00:00Z"
 *             startTime: "08:00:00"
 *             endTime: "12:00:00"
 *             note: "40"
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Tarea creada exitosamente"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               message: "¡La tarea de propuesta de tesis ya existe!"
 *       404:
 *         description: No se encontró algún registro necesario
 *         content:
 *           application/json:
 *             examples:
 *               courseSedeNotFound:
 *                 value:
 *                   message: "No se encontró una asignación válida de curso, sede y año"
 *               yearNotFound:
 *                 value:
 *                   message: "No se encontró un registro para el año especificado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error al crear la tarea"
 *               error: "Detalle del error"
 */
router.post(
  "/tareas",
  authMiddleware,
  obtenerUserIdDeToken,
  admin,
  extractSedeIdMiddleware,
  createTask
);

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
