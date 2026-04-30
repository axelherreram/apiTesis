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
 *   name: Students
 *   description: Student and user management
 */

/**
 * @swagger
 * /api/locations/{sede_id}/courses/{course_id}/students/{year}:
 *   get:
 *     summary: List students enrolled in a course at a specific sede for a given year
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sede ID
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Course ID
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Registration year
 *     responses:
 *       200:
 *         description: Student list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course, sede or students not found
 *       500:
 *         description: Server error
 */
router.get(
  "/locations/:sede_id/courses/:course_id/students/:year",
  authMiddleware,
  adminOrTerna,
  getUserIdToken,
  userController.getUsersByCourse
);


/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/users/profile",
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
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede a la que pertenecerá el administrador
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

// Ruta: Activar/Desactivar un administrador
/**
 * @swagger
 * /api/admin/toggle-status:
 *   put:
 *     summary: Activar o desactivar a un administrador de una sede
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
 *                 description: ID del administrador a activar/desactivar
 *               active:
 *                 type: boolean
 *                 description: Estado activo (true) o inactivo (false)
 *             required:
 *               - user_id
 *               - active
 *     responses:
 *       200:
 *         description: Estado del administrador actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Administrador activado exitosamente."
 *       400:
 *         description: Datos inválidos o no se puede desactivar al único administrador activo
 *       404:
 *         description: Administrador no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.put(
  "/admin/toggle-status",
  authMiddleware,
  extractSedeIdMiddleware,
  coordinador_sede,
  userController.toggleAdminStatus
);

/**
 * @swagger
 * /api/admins/{sede_id}:
 *   get:
 *     summary: Listar todos los administradores registrados de una sede específica
 *     tags: [Administradores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       carnet:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                         description: Estado activo/inactivo del administrador
 *                       sede:
 *                         type: object
 *                         properties:
 *                           sede_id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                       profilePhoto:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes acceso a los administradores de esta sede
 *       404:
 *         description: No se encontraron administradores en esta sede
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/admins/:sede_id",
  authMiddleware, 
  coordinador_sede, 
  extractSedeIdMiddleware,
  userController.listAllAdmins 
);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Register a student for history (no login access)
 *     security:
 *       - bearerAuth: []
 *     tags: [Students]
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
 *               name:
 *                 type: string
 *               carnet:
 *                 type: string
 *             required:
 *               - email
 *               - name
 *     responses:
 *       201:
 *         description: Student registered successfully.
 *       400:
 *         description: Email or carnet already in use.
 *       500:
 *         description: Server error.
 */
router.post(
  "/users/create",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  userController.createUserNotlog
);

module.exports = router;
