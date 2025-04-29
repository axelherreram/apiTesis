const express = require("express");
const {
  listAllLogs,
  listLogsByUser,
} = require("../controllers/appLogController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

// Middleware para verificar el rol de administrador, coordinador sede y coordinador general
// (roles 3, 4 y 5 respectivamente)
const allowed = verifyRole([3, 4, 5]);

/**
 * @swagger
 * tags:
 *   name: Bitácora
 *   description: Operaciones de bitácora
 */

/**
 * @swagger
 * /api/bitacoraxuser/{user_id}:
 *   get:
 *     tags: [Bitácora]
 *     summary: Listar las bitácoras de un usuario
 *     description: Obtiene una lista de todas las entradas de la bitácora para un usuario específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario para el que se listarán las bitácoras
 *     responses:
 *       200:
 *         description: Lista de bitácoras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bitacora'
 *       404:
 *         description: No se encontraron entradas de bitácora para este usuario
 *       500:
 *         description: Error en el servidor
 */
router.get("/bitacoraxuser/:user_id", authMiddleware, allowed, listLogsByUser);
/**
 * @swagger
 * /api/bitacora/{sede_id}:
 *   get:
 *     tags: [Bitácora]
 *     summary: Listar todas las bitácoras
 *     description: Obtiene una lista de todas las entradas de la bitácora en el sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para la que se listarán las bitácoras
 *     responses:
 *       200:
 *         description: Lista completa de bitácoras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bitacora'
 *       404:
 *         description: No se encontraron entradas de bitácora
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/bitacora/:sede_id",
  authMiddleware,
  allowed,
  extractSedeIdMiddleware,
  listAllLogs
);

module.exports = router;
