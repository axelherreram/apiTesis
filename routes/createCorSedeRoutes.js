const express = require("express");
const { 
  createCorSede, 
  listSedeCoordinators, 
  removeSedeCoordinator, 
  assignSedeCoordinator 
} = require("../controllers/createCorSedeController");
const authMiddleware = require("../middlewares/authMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

// Middleware para verificar el rol de coordinador de sede
const coordinadorGeneral = verifyRole([5]);

/**
 * @swagger
 * tags:
 *   - name: Coordinador de Sede
 *     description: Operaciones exclusivas para coordinadores de sede
 */

/**
 * @swagger
 * /api/createCorSede:
 *   post:
 *     summary: Crear un nuevo usuario y asignar cursos a una sede
 *     tags: [Coordinador de Sede]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - carnet
 *               - sede_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               carnet:
 *                 type: string
 *                 description: Carnet del usuario
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede
 *     responses:
 *       201:
 *         description: Usuario y asignaciones creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     carnet:
 *                       type: string
 *                     sede_id:
 *                       type: integer
 *                 temporaryPassword:
 *                   type: string
 *                   description: Contraseña temporal generada para el usuario
 *       400:
 *         description: Datos de entrada inválidos
 *       403:
 *         description: No autorizado para acceder a esta sede
 *       404:
 *         description: Sede no encontrada
 *       409:
 *         description: Usuario ya existe
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/createCorSede",
  authMiddleware,
  getUserIdToken,
  coordinadorGeneral,
  createCorSede
);

/**
 * @swagger
 * /api/coordinator/list:
 *   get:
 *     summary: Listar todos los coordinadores de sede
 *     tags: [Coordinador de Sede]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de coordinadores recuperada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       carnet:
 *                         type: string
 *                       sede_id:
 *                         type: integer
 *                       Sede:
 *                         type: object
 *                         properties:
 *                           nameSede:
 *                             type: string
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/coordinator/list",
  authMiddleware,
  getUserIdToken,
  coordinadorGeneral,
  listSedeCoordinators
);

/**
 * @swagger
 * /api/coordinator/remove:
 *   post:
 *     summary: Remover un coordinador de sede
 *     tags: [Coordinador de Sede]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - sede_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario coordinador
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede
 *     responses:
 *       200:
 *         description: Coordinador removido exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Coordinador o sede no encontrados
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/coordinator/remove",
  authMiddleware,
  getUserIdToken,
  coordinadorGeneral,
  removeSedeCoordinator
);

/**
 * @swagger
 * /api/coordinator/assign:
 *   post:
 *     summary: Asignar un coordinador a una sede
 *     tags: [Coordinador de Sede]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - sede_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario coordinador
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede
 *     responses:
 *       200:
 *         description: Coordinador asignado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Coordinador o sede no encontrados
 *       409:
 *         description: La sede ya tiene un coordinador asignado
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/coordinator/assign",
  authMiddleware,
  getUserIdToken,
  coordinadorGeneral,
  assignSedeCoordinator
);

module.exports = router; 