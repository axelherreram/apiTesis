const express = require("express");
const router = express.Router();
const {
  listUsersByGroupAndSede,
  listGroupBySedeAndYear,
} = require("../controllers/groupComisionController");
const authMiddleware = require("../middlewares/authMiddleware"); // JWT middleware para seguridad
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]);
/**
 * @swagger
 * tags:
 *   name: Grupos de Comisión
 *   description: Operaciones para gestionar y listar grupos de comisión y sus catedráticos/profesores.
 */

/**
 * @swagger
 * /api/group-comision/users:
 *   get:
 *     summary: Listar catedráticos/profesores de una comisión en una sede específica
 *     description: Obtiene una lista de catedráticos/profesores en un grupo de comisión específico dentro de una sede.
 *     tags: [Grupos de Comisión]
 *     security:
 *       - bearerAuth: []  # Requiere autenticación JWT
 *     parameters:
 *       - in: query
 *         name: group_id
 *         required: true
 *         description: ID del grupo de comisión
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sede_id
 *         required: true
 *         description: ID de la sede
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de catedráticos/profesores en el grupo de comisión y sede especificados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group_id:
 *                   type: integer
 *                 sede_id:
 *                   type: integer
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: Grupo de comisión o sede no encontrado
 *       500:
 *         description: Error en el servidor al listar los catedráticos/profesores
 */
router.get("/group-comision/users", authMiddleware, admin, extractSedeIdMiddleware, listUsersByGroupAndSede);

/**
 * @swagger
 * /api/group-comision:
 *   get:
 *     summary: Listar todos los grupos de comisión por sede y año
 *     description: Obtiene una lista de grupos de comisión filtrados por sede y año.
 *     tags: [Grupos de Comisión]
 *     security:
 *       - bearerAuth: []  # Requiere autenticación JWT
 *     parameters:
 *       - in: query
 *         name: sede_id
 *         required: true
 *         description: ID de la sede para filtrar los grupos de comisión
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         description: Año para filtrar los grupos de comisión
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de grupos de comisión para la sede y año especificados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupComision'
 *       404:
 *         description: Año o sede no encontrados
 *       500:
 *         description: Error en el servidor al listar los grupos
 */
router.get("/group-comision", authMiddleware, admin, extractSedeIdMiddleware, listGroupBySedeAndYear);

module.exports = router;
