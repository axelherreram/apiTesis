const express = require("express");
const { getStudentsComisionByYear } = require("../controllers/studentComisionController");
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");


const admin = verifyRole([3, 5]);

/**
 * @swagger
 * tags:
 *   - name: studentComision
 *     description: Operaciones relacionadas con los estudiantes en las comisiones
 * 
 * /api/comisiones/students/{year}/{sede_id}:
 *   get:
 *     summary: Obtener estudiantes por año y sede
 *     description: Devuelve una lista de estudiantes que pertenecen a una comisión para un año y sede específicos.
 *     tags:
 *       - studentComision
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: El año del estudiante.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sede_id
 *         required: true
 *         description: El ID de la sede donde se encuentra el estudiante.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de estudiantes obtenidos con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   user_name:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: No autorizado. Token de autenticación inválido o no proporcionado.
 *       404:
 *         description: No se encontraron estudiantes.
 *     security:
 *       - BearerAuth: []
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get("/comisiones/students/:year/:sede_id", authMiddleware, admin, extractSedeIdMiddleware, getStudentsComisionByYear);

module.exports = router;
