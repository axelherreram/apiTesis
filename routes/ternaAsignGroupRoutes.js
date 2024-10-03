const express = require("express");
const { createTernaAsignGroup,listGroupAsingTerna } = require("../controllers/ternaAsignGroupController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const router = express.Router();
const admin = verifyRole([3]);

/**
 * @swagger
 * /api/terna-asign-group/create:
 *   post:
 *     summary: Asigna múltiples terna a un grupo
 *     tags:
 *        - Terna Asign Group
 *     security:
 *       - bearerAuth: []  # Añadir seguridad con JWT si es necesario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   description: ID del usuario que se va a asignar
 *                 sede_id:
 *                   type: integer
 *                   description: ID de la sede a la cual pertenece el grupo terna
 *                 year:
 *                   type: integer
 *                   description: Año de la asignación
 *                 rolTerna_id:
 *                   type: integer
 *                   description: Rol asignado en el grupo terna
 *             example:
 *               - user_id: 1
 *                 sede_id: 1
 *                 year: 2024
 *                 rolTerna_id: 1
 *               - user_id: 17
 *                 sede_id: 1
 *                 year: 2024
 *                 rolTerna_id: 1
 *               - user_id: 16
 *                 sede_id: 1
 *                 year: 2024
 *                 rolTerna_id: 2
 *               - user_id: 15
 *                 sede_id: 1
 *                 year: 2024
 *                 rolTerna_id: 3
 *     responses:
 *       201:
 *         description: Asignaciones creadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asignaciones creadas exitosamente
 *       400:
 *         description: Error en la solicitud, como un año inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El año no puede ser mayor al actual
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al crear las asignaciones
 */
router.post("/terna-asign-group/create", authMiddleware, obtenerUserIdDeToken, admin, createTernaAsignGroup);


/**
 * @swagger
 * /api/group-asing-Terna/{groupTerna_id}:
 *   get:
 *     summary: Listar todos los catedraticos asignados a una terna.
 *     description: Obtiene una lista de todos los catedraticos asignados a un grupo de ternas por ID de grupo.
 *     tags:
 *       - Terna Asign Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupTerna_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del grupo.
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de grupos de ternas junto con los usuarios asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   groupTerna_id:
 *                     type: integer
 *                     description: ID del grupo de terna
 *                   sede_id:
 *                     type: integer
 *                     description: ID de la sede
 *                   year_id:
 *                     type: integer
 *                     description: ID del año
 *                   users:
 *                     type: array
 *                     description: Lista de usuarios asignados al grupo
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           description: ID del usuario
 *                         name:
 *                           type: string
 *                           description: Nombre del usuario
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parámetros inválidos
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
router.get("/group-asing-Terna/:groupTerna_id", authMiddleware, obtenerUserIdDeToken, admin, listGroupAsingTerna);


module.exports = router;
 