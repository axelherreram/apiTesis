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
 *   - name: Tareas
 *     description: Operaciones de Tarea - obtener y actualizar
 */

/**
 * @swagger
 * /api/tareas/{sede_id}/{year}:
 *   get:
 *     summary: Lista todas las tareas
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: id de la sede para obtener las tareas
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: año para obtener las tareas
 *     responses:
 *       200:
 *         description: Retorna una lista de tareas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
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
 *     summary: Lista todas las tareas de un curso específico
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso para obtener las tareas
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
 *         description: año para obtener las tareas del curso
 *     responses:
 *       200:
 *         description: Retorna una lista de tareas del curso especificado.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: No se encontraron tareas para el curso especificado.
 *       500:
 *         description: Error del servidor.
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
 *     tags: [Tareas]
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
 *                 description: Título actualizado de la tarea
 *                 example: "CAPITULO 6"
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la tarea
 *                 example: "REALIZAR EL CAPÍTULO 6 DEL PROYECTO DE GRADUACIÓN"
 *               taskStart:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio de la tarea, opcional
 *                 example: null
 *               endTask:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de finalización de la tarea, opcional
 *                 example: null
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error al actualizar la tarea.
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
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               course_id:
 *                 type: integer
 *                 description: ID del curso
 *                 example: 1
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede
 *                 example: 1
 *               typeTask_id:
 *                 type: integer
 *                 description: ID del tipo de tarea
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Título de la tarea
 *                 example: "CAPITULO 1"
 *               description:
 *                 type: string
 *                 description: Descripción de la tarea
 *                 example: "REALIZAR EL CAPÍTULO 1 DEL PROYECTO DE GRADUACIÓN"
 *               taskStart:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio de la tarea
 *                 example: "2024-09-03T00:00:00Z"
 *               endTask:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de finalización de la tarea
 *                 example: "2024-09-10T00:00:00Z"
 *               note:
 *                 type: string
 *                 description: Nota de la tarea
 *                 example: "35"
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error al crear la tarea.
 */
router.post("/tareas", authMiddleware, obtenerUserIdDeToken, admin, createTask);

/**
 * @swagger
 * /api/tareas/usuario/{user_id}/{task_id}:
 *   get:
 *     summary: Obtiene la información de una tarea y las entregas del usuario
 *     tags: [Tareas]
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
 *         description: Retorna la tarea y las entregas del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Tarea'
 *                 submissions:
 *                   type: object
 *                   description: Información de la entrega del usuario.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Usuario o tarea no encontrados.
 *       500:
 *         description: Error al obtener la información.
 */
router.get("/tareas/usuario/:user_id/:task_id", authMiddleware, obtenerUserIdDeToken, listInfoTaksByUser);

module.exports = router;
