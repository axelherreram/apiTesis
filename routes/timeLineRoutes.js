const {
  listTimeline,
  createTimeline,
} = require("../controllers/timelineController");
const express = require("express");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Timeline
 *   description: Operaciones relacionadas con eventos en la línea de tiempo
 */

/**
 * @swagger
 * /api/timeline/{user_id}/{course_id}:
 *   get:
 *     summary: Lista todos los eventos de la línea de tiempo de un usuario en un curso específico
 *     tags: [Timeline]
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
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Una lista de eventos de la línea de tiempo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimelineEventos'
 *       404:
 *         description: Usuario o curso no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get("/timeline/:user_id/:course_id", authMiddleware, listTimeline);

/**
 * @swagger
 * /api/create/comentario:
 *   post:
 *     summary: Crear un nuevo comentario en la línea de tiempo
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que está realizando el comentario
 *                 example: 101
 *               description:
 *                 type: string
 *                 description: Descripción del comentario
 *                 example: "Este es un comentario sobre la entrega"
 *               course_id:
 *                 type: integer
 *                 description: ID del curso al que pertenece la entrega
 *                 example: 202
 *               task_id:
 *                 type: integer
 *                 description: ID de la entrega o tarea sobre la cual se hace el comentario
 *                 example: 303
 *             required:
 *               - user_id
 *               - description
 *               - course_id
 *               - task_id
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimelineEventos'
 *       404:
 *         description: Usuario o curso no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.post(
  "/create/comentario",
  authMiddleware,
  admin,
  obtenerUserIdDeToken,
  extractSedeIdMiddleware,
  createTimeline
);

module.exports = router;
