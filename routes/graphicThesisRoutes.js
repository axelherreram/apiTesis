const { Router } = require("express");
const router = Router();
const {
  getRevisionStatistics,
  getRevisionStatisticsBySede,
  getRevisionStatisticsByDateRange,
} = require("../controllers/graphicThesisController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const cordThesis = verifyRole([6]);

/**
 * @swagger
 * /api/revision-thesis/statistics:
 *   get:
 *     summary: Obtener estadísticas generales de revisiones
 *     description: Obtiene el total de revisiones recibidas, aprobadas, no aprobadas, activas y el total de revisores.
 *     tags:
 *       - Estadísticas de Revisiones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de revisiones obtenidas con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estadísticas de revisiones obtenidas con éxito
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevisions:
 *                       type: integer
 *                       example: 50
 *                       description: Total de revisiones recibidas.
 *                     totalApprovedRevisions:
 *                       type: integer
 *                       example: 30
 *                       description: Total de revisiones aprobadas.
 *                     totalRejectedRevisions:
 *                       type: integer
 *                       example: 10
 *                       description: Total de revisiones no aprobadas.
 *                     totalActiveRevisions:
 *                       type: integer
 *                       example: 40
 *                       description: Total de revisiones activas.
 *                     totalRevisores:
 *                       type: integer
 *                       example: 5
 *                       description: Total de revisores.
 *       500:
 *         description: Error al obtener las estadísticas de revisiones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener las estadísticas de revisiones
 *                 error:
 *                   type: string
 *                   example: Mensaje de error detallado.
 */
router.get(
  "/revision-thesis/statistics",
  authMiddleware,
  cordThesis,
  getRevisionStatistics
);

/**
 * @swagger
 * /api/revision-thesis/statistics-by-sede:
 *   get:
 *     summary: Obtener solicitudes de revisiones por sede
 *     description: Obtiene el total de solicitudes de revisiones enviadas desde cada sede.
 *     tags:
 *       - Estadísticas de Revisiones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitudes por sede obtenidas con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Solicitudes por sede obtenidas con éxito
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sede:
 *                         type: string
 *                         example: Sede Central
 *                         description: Nombre de la sede.
 *                       totalRequests:
 *                         type: integer
 *                         example: 25
 *                         description: Total de solicitudes enviadas desde esta sede.
 *       500:
 *         description: Error al obtener las solicitudes por sede.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener las solicitudes por sede
 *                 error:
 *                   type: string
 *                   example: Mensaje de error detallado.
 */
router.get(
  "/revision-thesis/statistics-by-sede",
  authMiddleware,
  cordThesis,
  getRevisionStatisticsBySede
);

/**
 * @swagger
 * /api/revision-thesis/statistics-by-date-range:
 *   get:
 *     summary: Obtener estadísticas de revisiones por rango de meses
 *     description: Obtiene el total de revisiones aprobadas y no aprobadas dentro de un rango de meses.
 *     tags:
 *       - Estadísticas de Revisiones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startMonth
 *         type: string
 *         required: true
 *         description: Mes inicial en formato YYYY-MM.
 *         example: 2023-01
 *       - in: query
 *         name: endMonth
 *         type: string
 *         required: true
 *         description: Mes final en formato YYYY-MM.
 *         example: 2023-12
 *     responses:
 *       200:
 *         description: Estadísticas de revisiones obtenidas con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estadísticas de revisiones obtenidas con éxito
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalApprovedRevisions:
 *                       type: integer
 *                       example: 15
 *                       description: Total de revisiones aprobadas.
 *                     totalRejectedRevisions:
 *                       type: integer
 *                       example: 5
 *                       description: Total de revisiones no aprobadas.
 *                     startMonth:
 *                       type: string
 *                       example: 2023-01
 *                       description: Mes inicial del rango.
 *                     endMonth:
 *                       type: string
 *                       example: 2023-12
 *                       description: Mes final del rango.
 *       400:
 *         description: Error en los parámetros de entrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se requieren los parámetros startMonth y endMonth
 *       500:
 *         description: Error al obtener las estadísticas de revisiones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener las estadísticas de revisiones
 *                 error:
 *                   type: string
 *                   example: Mensaje de error detallado.
 */
router.get(
  "/revision-thesis/statistics-by-date-range",
  authMiddleware,
  cordThesis, 
  getRevisionStatisticsByDateRange
);

module.exports = router;

