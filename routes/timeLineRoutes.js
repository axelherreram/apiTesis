const {
  getTimelineByUserId,
  getTimelineByUserAndTask,
} = require("../controllers/timelineController");
const express = require("express");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();
const adminOrDecano = verifyRole([1,3]);

// Swagger: Obtener todos los eventos de un usuario
/**
 * @swagger
 * /api/timeline/user/{user_id}:
 *   get:
 *     summary: Obtener la línea de tiempo de eventos de un usuario
 *     description: Obtiene todos los eventos de la línea de tiempo para un usuario específico basado en su user_id
 *     tags:
 *       - timeline
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: ID del usuario para obtener sus eventos
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   evento_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   typeEvent:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   task_id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Usuario no encontrado o sin eventos
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/timeline/user/:user_id",
  authMiddleware,
  adminOrDecano,
  getTimelineByUserId
);

// Swagger: Obtener todos los eventos de un usuario para una tarea específica
/**
 * @swagger
 * /api/timeline/user/{user_id}/task/{task_id}:
 *   get:
 *     summary: Obtener eventos de un usuario para una tarea específica
 *     description: Obtiene todos los eventos de un usuario para una tarea específica, basada en user_id y task_id
 *     tags:
 *       - timeline
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: ID del usuario para obtener sus eventos
 *         required: true
 *         schema:
 *           type: integer
 *       - name: task_id
 *         in: path
 *         description: ID de la tarea para obtener eventos específicos
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos obtenidos para la tarea y usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   evento_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   typeEvent:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   task_id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Usuario o tarea no encontrados
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/timeline/user/:user_id/task/:task_id",
  authMiddleware,
  adminOrDecano,
  getTimelineByUserAndTask
);

module.exports = router;
