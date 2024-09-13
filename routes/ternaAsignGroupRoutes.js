const express = require("express");
const { createTernaAsignGroup } = require("../controllers/ternaAsignGroupController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const router = express.Router();
const admin = verifyRole([3]);

/**
 * @swagger
 * /api/terna-asign-group/create:
 *   post:
 *     summary: Asignar un usuario a un grupo
 *     description: Crea una nueva asignación de usuario a un grupo, cada grupo puede tener un máximo de 3 usuarios.
 *     tags:
 *       - Terna Asign Group
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
 *                 description: ID del usuario que será asignado al grupo.
 *                 example: 1
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede.
 *                 example: 1
 *               year:
 *                 type: integer
 *                 description: Año actual.
 *                 example: 2024
 *               rolTerna_id:
 *                 type: integer
 *                 description: ID del rol del usuario en la terna.
 *                 example: 1
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asignación creada exitosamente
 *       400:
 *         description: El grupo ya tiene 3 usuarios asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Este grupo ya tiene 3 usuarios asignados.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post("/terna-asign-group/create", authMiddleware, obtenerUserIdDeToken, admin, createTernaAsignGroup);

module.exports = router;
