const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const router = express.Router();

// Middleware para verificar que el usuario tenga rol de Admin o Terna
const adminOrTerna = verifyRole([2, 3]); // Rol 2 para Terna, Rol 3 para Admin
const admin = verifyRole([3]); // Solo Admin

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
 *                   userName:
 *                     type: string
 *                   carnet:
 *                     type: string
 *                   sede:
 *                     type: integer
 *                   registrationYear:
 *                     type: integer
 *                   roleName:
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
  authMiddleware,              // Verifica si el usuario está autenticado
  adminOrTerna,                // Solo Admin o Terna pueden acceder
  obtenerUserIdDeToken,        // Extrae el user_id del token JWT
  userController.getUsersByCourse // Llama al controlador para listar usuarios por curso y sede
);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado por token
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del perfil del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 userName:
 *                   type: string
 *                 profilePhoto:
 *                   type: string
 *                 carnet:
 *                   type: string
 *                 sede:
 *                   type: integer
 *                 registrationYear:
 *                   type: integer
 *                 roleName:
 *                   type: string
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
 * /api/sedes/{sede_id}/usuarios/no-terna/{year}:
 *   get:
 *     summary: Listar todos los estudiantes que no están asignados a ninguna terna en una sede específica y registrados en un año determinado
 *     tags: [Usuarios]
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
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año de registro para filtrar a los estudiantes
 *     responses:
 *       200:
 *         description: Lista de estudiantes no asignados a terna obtenida exitosamente
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
 *                   userName:
 *                     type: string
 *                   carnet:
 *                     type: string
 *                   sede:
 *                     type: integer
 *                   profilePhoto:
 *                     type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Estudiantes no encontrados
 *       500:
 *         description: Error en el servidor
 */
router.get(
  "/sedes/:sede_id/usuarios/no-terna/:year",
  authMiddleware,            
  admin,               
  obtenerUserIdDeToken,        
  userController.listStudentNotTerna 
);

/**
 * @swagger
 * /api/sedes/{sede_id}/usuarios/data-graphics:
 *   get:
 *     summary: Obtener estadísticas de estudiantes para una sede específica
 *     tags: [Usuarios]
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
  "/sedes/:sede_id/usuarios/data-graphics",
  authMiddleware,          
  admin,                  
  userController.dataGraphics 
);

module.exports = router;
