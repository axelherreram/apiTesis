const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const router = express.Router();

// Middleware para verificar que el usuario tenga rol de Admin o Terna
const adminOrTerna = verifyRole([2, 3]);
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y filtrado
 */

/**
 * @swagger
 * /api/sedes/{sede_id}/cursos/{course_id}/usuarios/{year}:
 *   get:
 *     summary: Listar todos los usuarios asignados a un curso en una sede específica y registrados en un año determinado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para listar los usuarios
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso para listar los usuarios asignados
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de registro para filtrar a los usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios asignados al curso obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   carnet:
 *                     type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Curso, sede o usuarios no encontrados
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/sedes/:sede_id/cursos/:course_id/usuarios/:year",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.getUsersByCourse
);

module.exports = router;
