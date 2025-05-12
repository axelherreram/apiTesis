const express = require("express");
const router = express.Router();
const { listYears } = require("../controllers/yearController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Años
 *   description: Operaciones relacionadas con los años
 */

/**
 * @swagger
 * /api/years:
 *   get:
 *     summary: Listar todos los años
 *     description: Devuelve una lista de todos los años registrados en la base de datos.
 *     tags: [Años]
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
router.get("/years", authMiddleware, listYears);

module.exports = router;
