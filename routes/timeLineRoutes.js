const {
  listTimeline,
  createTimeline,
} = require("../controllers/timelineController");
const express = require("express");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

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
 *             $ref: '#/components/schemas/TimelineEventos'
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
  createTimeline
);

module.exports = router;
