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
 * /api/usuarios/estudiantes:
 *   get:
 *     summary: Listar todos los usuarios con rol de estudiante
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudiantes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   carnet:
 *                     type: string
 *                   sede:
 *                     type: integer
 *                   rol:
 *                     type: integer
 *                   anio:
 *                     type: integer
 *       401:
 *         description: No autorizado
 */
router.get(
  "/usuarios/estudiantes",
  authMiddleware,
  obtenerUserIdDeToken,
  adminOrTerna,
  userController.listStudents
);

/**
 * @swagger
 * /api/usuarios/sede/{sede_id}:
 *   get:
 *     summary: Filtrar usuarios por sede
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para filtrar
 *     responses:
 *       200:
 *         description: Lista de usuarios filtrada por sede obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   carnet:
 *                     type: string
 *                   sede:
 *                     type: integer
 *                   rol:
 *                     type: integer
 *                   anio:
 *                     type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  "/usuarios/sede/:sede_id",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.filterUsersBySede
);

/**
 * @swagger
 * /api/usuarios/anio/{registrationYear}:
 *   get:
 *     summary: Filtrar usuarios por año de registro
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationYear
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de registro para filtrar
 *     responses:
 *       200:
 *         description: Lista de usuarios filtrada por año obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   carnet:
 *                     type: string
 *                   sede:
 *                     type: integer
 *                   rol:
 *                     type: integer
 *                   anio:
 *                     type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  "/usuarios/anio/:registrationYear",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.filterUsersByYear
);


/**
 * @swagger
 * /api/cursos/{course_id}/usuarios:
 *   get:
 *     summary: Listar todos los usuarios asignados a un curso
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso para listar los usuarios asignados
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
 *         description: Curso no encontrado o no hay usuarios asignados
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/cursos/:course_id/usuarios",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.getUsersByCourse
);

module.exports = router;
