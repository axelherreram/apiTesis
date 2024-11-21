const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");

const router = express.Router();

const adminOrTerna = verifyRole([2, 3]); // Roles permitidos: Terna (2), Admin (3)
const admin = verifyRole([3]); // Solo Admin

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestión de estudiantes y filtrado
 */

/**
 * @swagger
 * /api/sedes/{sede_id}/cursos/{course_id}/estudiantes/{year}:
 *   get:
 *     summary: Listar todos los estudiantes asignados a un curso en una sede específica y registrados en un año determinado
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para listar los estudiantes
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso para listar los estudiantes asignados
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de registro para filtrar a los estudiantes
 *     responses:
 *       200:
 *         description: Lista de estudiantes asignados al curso obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Curso, sede o estudiantes no encontrados
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/sedes/:sede_id/cursos/:course_id/estudiantes/:year",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.getUsersByCourse
);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado por token
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del perfil del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/usuarios/perfil",
  authMiddleware,
  obtenerUserIdDeToken,
  userController.listuserbytoken
);

/**
 * @swagger
 * /api/sedes/{sede_id}/estudiantes/data-graphics:
 *   get:
 *     summary: Obtener estadísticas de estudiantes para una sede específica
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para obtener las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: integer
 *                 totalStudentsSede:
 *                   type: integer
 *                 totalStudentsClosedGlobal:
 *                   type: integer
 *                 totalStudentsClosed:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sede no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/sedes/:sede_id/estudiantes/data-graphics",
  authMiddleware,
  admin,
  userController.dataGraphics
);

module.exports = router;
