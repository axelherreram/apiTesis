const express = require("express");
const router = express.Router();
const { listYears } = require("../controllers/yearController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

// Verificar si el usuario tiene el rol de admin (rol_id: 3)
const adminOrSuper = verifyRole([3]);

/**
 * @swagger
 * components:
 *   schemas:
 *     Year:
 *       type: object
 *       properties:
 *         year_id:
 *           type: integer
 *           description: ID único del año
 *         year:
 *           type: integer
 *           description: El valor del año 
 *       example:
 *         year_id: 1
 *         year: 2024
 */

/**
 * @swagger
 * tags:
 *   name: Years
 *   description: Operaciones relacionadas con los años
 */

/**
 * @swagger
 * /api/years:
 *   get:
 *     summary: Listar todos los años
 *     description: Devuelve una lista de todos los años registrados en la base de datos.
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de años obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Year'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido 
 *       500:
 *         description: Error en el servidor al obtener los años
 */
router.get("/years", authMiddleware, adminOrSuper, listYears);

module.exports = router;
