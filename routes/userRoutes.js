// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/roleMiddleware');
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
router.get('/usuarios/estudiantes', authMiddleware, adminOrTerna,userController.listStudents);

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
router.get('/usuarios/sede/:sede_id', authMiddleware, adminOrTerna, userController.filterUsersBySede);

/**
 * @swagger
 * /api/usuarios/anio/{anioRegistro}:
 *   get:
 *     summary: Filtrar usuarios por año de registro
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: anioRegistro
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
router.get('/usuarios/anio/:anioRegistro', authMiddleware, adminOrTerna, userController.filterUsersByAnio);

/**
 * @swagger
 * /api/usuarios/allUsers:
 *   get:
 *     summary: Listar todos los usuarios con rol de terna solo para el rol administrador
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                   anio:
 *                     type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/usuarios/allUsers', authMiddleware, admin, userController.listUsuariosAdmin);

module.exports = router;
