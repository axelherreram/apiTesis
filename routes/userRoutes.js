const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

const adminOrTerna = verifyRole([2, 3]); // Roles permitidos: Terna (2), Admin (3)
const admin = verifyRole([3]); // Solo Admin
const superAdmin = verifyRole([4]); // Solo Admin
const adminOrSuperAdmin = verifyRole([3, 4]); // Solo Admin

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
  extractSedeIdMiddleware,
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
 * /api/admin/create:
 *   post:
 *     summary: Crear un nuevo administrador
 *     tags: [Administradores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del administrador
 *               name:
 *                 type: string
 *                 description: Nombre completo del administrador
 *               carnet:
 *                 type: string
 *                 description: Carnet del administrador
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede del administrador
 *             required:
 *               - email
 *               - name
 *               - carnet
 *               - sede_id
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/User'
 *                 password:
 *                   type: string
 *                   description: Contraseña generada para el administrador
 *       400:
 *         description: Datos inválidos o correo ya registrado
 *       500:
 *         description: Error en el servidor
 */
router.post(
  "/admin/create",
  authMiddleware,
  superAdmin,
  userController.createAdmin
);
/**
 * @swagger
 * /api/admin/assign:
 *   post:
 *     summary: Asignar un administrador a una sede
 *     tags: [Administradores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que será asignado como administrador
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede donde será asignado el administrador
 *             required:
 *               - user_id
 *               - sede_id
 *     responses:
 *       200:
 *         description: Administrador asignado a la sede exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Límite de administradores alcanzado o datos inválidos
 *       404:
 *         description: Usuario o sede no encontrados
 *       500:
 *         description: Error en el servidor
 */
router.post(
  "/admin/assign",
  authMiddleware,
  superAdmin,
  userController.assignAdminToSede
);

// Ruta: Eliminar un administrador
/**
 * @swagger
 * /api/admin/remove:
 *   put:
 *     summary: Eliminar a un administrador de una sede
 *     tags: [Administradores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del administrador a eliminar
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede de la que se eliminará al administrador
 *             required:
 *               - user_id
 *               - sede_id
 *     responses:
 *       200:
 *         description: Administrador eliminado exitosamente
 *       404:
 *         description: Administrador no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.put(
  "/admin/remove",
  authMiddleware,
  superAdmin,
  userController.removeAdmin
);

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: Listar todos los administradores registrados
 *     tags: [Administradores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida exitosamente
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
 *                   name:
 *                     type: string
 *                   carnet:
 *                     type: string
 *                   sede:
 *                     type: object
 *                     properties:
 *                       sede_id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                   profilePhoto:
 *                     type: string
 *                     nullable: true
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No se encontraron administradores
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/admins",
  authMiddleware, // Middleware de autenticación
  superAdmin, // Middleware de roles (opcional, si solo superadmin puede acceder)
  userController.listAllAdmins // Método en el controlador
);


module.exports = router;
