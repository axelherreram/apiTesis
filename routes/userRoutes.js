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
 * /api/usuarios/anio/{sede_id}/{registrationYear}:
 *   get:
 *     summary: Filtrar usuarios por año de registro
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sede para filtrar los usuarios
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
 *                     description: Correo electrónico del usuario
 *                   userName:
 *                     type: string
 *                     description: Nombre completo del usuario
 *                   carnet:
 *                     type: string
 *                     description: Carnet del usuario
 *                   sede:
 *                     type: integer
 *                     description: ID de la sede del usuario
 *                   registrationYear:
 *                     type: integer
 *                     description: Año de registro del usuario
 *                   profilePhoto:
 *                     type: string
 *                     description: URL de la foto de perfil del usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: No se encontraron usuarios
 */
router.get(
  "/usuarios/anio/:sede_id/:registrationYear",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.filterUsersByYear
);

/**
 * @swagger
 * /api/sedes/{sede_id}/cursos/{course_id}/usuarios/{registrationYear}:
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
 *         name: registrationYear
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
  "/sedes/:sede_id/cursos/:course_id/usuarios/:registrationYear",
  authMiddleware,
  adminOrTerna,
  obtenerUserIdDeToken,
  userController.getUsersByCourse
);

module.exports = router;
