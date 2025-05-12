const express = require("express");
const { listCourses } = require("../controllers/courseController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Operaciones relacionadas con los cursos
 */

/**
 * @swagger
 * /api/cursos:
 *   get:
 *     summary: Obtener todos los cursos
 *     description: Obtiene todos los cursos de la base de datos
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Una lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Curso'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       500:
 *         description: Error en el servidor
 */
router.get("/cursos", authMiddleware, listCourses);

module.exports = router;
