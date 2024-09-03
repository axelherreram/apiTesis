const express = require("express");
const { listTasks, updateTask, listTasksByCourse } = require("../controllers/taskController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const router = express.Router();
const adminOrTerna = verifyRole([2, 3]);

/**
 * @swagger
 * tags:
 *   - name: Tareas
 *     description: Operaciones de Tarea - obtener y actualizar
 */

/**
 * @swagger
 * /api/tareas/{sede_id}:
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
router.get("/tareas/:sede_id", authMiddleware, obtenerUserIdDeToken, listTasks);

/**
 * @swagger
 * /api/tareas/curso/{sede_id}/{course_id}:
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
router.get("/tareas/curso/:sede_id/:course_id", authMiddleware, obtenerUserIdDeToken, listTasksByCourse);


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

module.exports = router;
