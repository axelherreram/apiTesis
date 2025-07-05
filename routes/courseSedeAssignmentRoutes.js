const express = require("express");
const {
  createSedeAssignment,
  getCoursesBySede,
} = require("../controllers/courseSedeAssignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

// Middleware para verificar el rol de coordinador de sede y coordinador general
const coordinador_sede = verifyRole([4, 5]);

const adminOrSuperadmin = verifyRole([1, 3, 4, 5]);

/**
 * @swagger
 * tags:
 *   - name: Asignación de curso a sede
 *     description: Operaciones de asignación de cursos a sedes
 */

/**
 * @swagger
 * /api/crearAsignacionSedeCurso:
 *   post:
 *     summary: Crear una asignación de curso a sede
 *     tags: [Asignación de curso a sede]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - sede_id
 *             properties:
 *               course_id:
 *                 type: integer
 *                 description: ID del curso a asignar
 *                 example: 1
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede donde se asignará el curso
 *                 example: 1
 *     responses:
 *       201:
 *         description: Asignación de curso a sede creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asignación de curso a sede creada exitosamente.
 *       400:
 *         description: Error en la creación de la asignación (curso en periodo incorrecto, asignación ya existente, etc.)
 *       403:
 *         description: No tienes permisos para asignar cursos a esta sede
 *       500:
 *         description: Error del servidor al crear la asignación
 */
router.post(
  "/crearAsignacionSedeCurso",
  authMiddleware,
  getUserIdToken,
  coordinador_sede,
  createSedeAssignment
);

/**
 * @swagger
 * /api/cursosPorSede/{sede_id}/{year}:
 *   get:
 *     summary: Obtener los cursos asignados a una sede
 *     tags: [Asignación de curso a sede]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede para la que se quieren obtener los cursos
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año para el que se quieren obtener los cursos
 *     responses:
 *       200:
 *         description: Cursos asignados a la sede recuperados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseSedeAssignment'
 *       404:
 *         description: No se encontraron cursos asignados a la sede
 *       500:
 *         description: Error del servidor al recuperar los cursos
 */
router.get(
  "/cursosPorSede/:sede_id/:year",
  authMiddleware,
  getUserIdToken,
  adminOrSuperadmin,
  extractSedeIdMiddleware,
  getCoursesBySede
);

module.exports = router;
