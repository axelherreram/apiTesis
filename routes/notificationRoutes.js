const express = require("express");
const router = express.Router();
const {
  getNotificationsBySede,
  getNotificationsByUser,
} = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const validateUser = require("../middlewares/validateUser");

const student = verifyRole([1]);
const admin = verifyRole([3,5]);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints para gestionar notificaciones
 */

/**
 * @swagger
 * /api/admin/notifications/{sede_id}:
 *   get:
 *     summary: Obtener notificaciones por sede (solo administradores)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede para filtrar las notificaciones
 *     responses:
 *       200:
 *         description: Lista de notificaciones de la sede
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   message:
 *                     type: string
 *                     example: "Nueva reunión programada"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-04T15:30:00Z"
 *       401:
 *         description: No autorizado, token faltante o inválido
 *       403:
 *         description: Acceso denegado para el rol del usuario
 *       404:
 *         description: No se encontraron notificaciones para la sede
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/admin/notifications/:sede_id",
  authMiddleware,
  admin,
  getNotificationsBySede
);

/**
 * @swagger
 * /api/student/notifications/{user_id}:
 *   get:
 *     summary: Obtener notificaciones por usuario (solo estudiantes)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario para filtrar las notificaciones
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   message:
 *                     type: string
 *                     example: "Tienes una nueva tarea asignada"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-04T10:00:00Z"
 *       401:
 *         description: No autorizado, token faltante o inválido
 *       403:
 *         description: Acceso denegado para el rol del usuario
 *       404:
 *         description: No se encontraron notificaciones para el usuario
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/student/notifications/:user_id",
  authMiddleware,
  student,
  getNotificationsByUser
);

module.exports = router;
