const express = require("express");
const { createSedeAssignment, getCoursesBySede } = require("../controllers/courseSedeAssignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();
const SuperAdmin = verifyRole([4]);
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   - name: CourseSedeAssignment
 *     description: Operaciones de asignación de cursos a sedes
 * components:
 *   schemas:
 *     CourseSedeAssignment:
 *       type: object
 *       properties:
 *         asigCourse_id:
 *           type: integer
 *           description: ID de la asignación de curso a sede
 *         course_id:
 *           type: integer
 *           description: ID del curso
 *           example: 1
 *         sede_id:
 *           type: integer
 *           description: ID de la sede
 *           example: 1
 *         courseActive:
 *           type: boolean
 *           description: Estado de activación del curso
 *       required:
 *         - course_id
 *         - sede_id
 *       example:  
 *         course_id: 1
 *         sede_id: 1
 */

/**
 * @swagger
 * /api/crearAsignacionSedeCurso:
 *   post:
 *     summary: Crear una asignación de curso a sede
 *     tags: [CourseSedeAssignment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseSedeAssignment'
 *     responses:
 *       201:
 *         description: Asignación de curso a sede creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseSedeAssignment'
 *       400:
 *         description: Error en la creación de la asignación (curso en periodo incorrecto, asignación ya existente, etc.)
 *       500:
 *         description: Error del servidor al crear la asignación
 */

/**
 * @swagger
 * /api/cursosPorSede/{sede_id}:
 *   get:
 *     summary: Obtener los cursos asignados a una sede
 *     tags: [CourseSedeAssignment]
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

router.post(
  "/crearAsignacionSedeCurso",
  authMiddleware,
  obtenerUserIdDeToken,
  SuperAdmin,
  createSedeAssignment
);

router.get(
  "/cursosPorSede/:sede_id",
  authMiddleware,
  obtenerUserIdDeToken,
  admin,
  getCoursesBySede
);

module.exports = router;