const express = require("express");
const { createSedeAssignment, getCoursesBySede } = require("../controllers/courseSedeAssignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();
const SuperAdmin = verifyRole([4]);
const admin = verifyRole([3,4]);

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
 *             properties:
 *               course_id:
 *                 type: integer
 *                 description: ID del curso
 *                 example: 1
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede
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
 *       500:
 *         description: Error del servidor al crear la asignación
 */
router.post(
  "/crearAsignacionSedeCurso",
  authMiddleware,
  obtenerUserIdDeToken,
  SuperAdmin,
  createSedeAssignment
);

/**
 * @swagger
 * /api/cursosPorSede/{sede_id}:
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
  "/cursosPorSede/:sede_id",
  authMiddleware,
  obtenerUserIdDeToken,
  admin,
  extractSedeIdMiddleware,
  getCoursesBySede
);

module.exports = router;
