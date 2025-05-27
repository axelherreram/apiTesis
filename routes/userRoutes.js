const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

const adminOrTerna = verifyRole([2, 3, 5]); // Roles permitidos: Terna (2), Admin (3)
const admin = verifyRole([3]); // Solo Admin
const coordinador_sede = verifyRole([4, 5]); 
const adminOrSuperAdmin = verifyRole([3, 4, 5]); // Solo Admin

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
  getUserIdToken,
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
  getUserIdToken,
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
 *             required:
 *               - email
 *               - name
 *               - carnet
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
  extractSedeIdMiddleware,
  coordinador_sede,
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
  coordinador_sede,
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
 *             required:
 *               - user_id
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
  extractSedeIdMiddleware,
  coordinador_sede,
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
  authMiddleware, 
  coordinador_sede, 
  userController.listAllAdmins 
);

/**
 * @swagger
 * /api/usuarios/crear:
 *   post:
 *     summary: Registrar un estudiante para historial (sin acceso a inicio de sesión)
 *     security:
 *       - bearerAuth: []
 *     tags: [Estudiantes]
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
 *                 description: Correo electrónico del estudiante.
 *               name:
 *                 type: string
 *                 description: Nombre completo del estudiante.
 *               carnet:
 *                 type: string
 *                 description: Número de identificación del estudiante.
 *             required:
 *               - email
 *               - name
 *     responses:
 *       201:
 *         description: Estudiante registrado exitosamente (sin acceso a inicio de sesión).
 *       400:
 *         description: Error en la solicitud (correo o carnet en uso, datos inválidos).
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/usuarios/crear",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  userController.createUserNotlog
);

module.exports = router;
