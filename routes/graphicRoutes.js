const express = require("express");
const router = express.Router();

const {
  dataGraphics,
  getTaskSubmissionStats,
} = require("../controllers/graphicController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]);
/**
 * @swagger
 * tags:
 *   name: graficas de datos
 *   description: Endpoints para obtener datos de gráficos
 */

/**
 * @swagger
 * /api/graphics/data/{sede_id}:
 *   get:
 *     summary: Obtener datos gráficos
 *     tags: [graficas de datos]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede
 *     responses:
 *       200:
 *         description: Successful response
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/graphics/data/:sede_id",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  dataGraphics
);

/**
 * @swagger
 * /api/graphics/task-stats/{course_id}/{year}/{sede_id}:
 *   get:
 *     summary: Obtener estadísticas de las tareas
 *     tags: [graficas de datos]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/graphics/task-stats/:course_id/:year/:sede_id",
  getTaskSubmissionStats,
  authMiddleware,
  admin
);

module.exports = router;
