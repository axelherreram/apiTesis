const express = require("express");
const {
  createCorThesis,
  listThesisCoordinators,
  deactivateThesisCoordinator,
  updateThesisCoordinator,
  activateThesisCoordinator,
} = require("../controllers/createCorThesisController");
const authMiddleware = require("../middlewares/authMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

// Middleware para verificar el rol de coordinador de tesis
defineCoordinadorTesis = verifyRole([5]);

/**
 * @swagger
 * tags:
 *   - name: Coordinador de Tesis
 *     description: Operaciones exclusivas para coordinador de tesis general
 */

/**
 * @swagger
 * /api/createCorThesis:
 *   post:
 *     summary: Crear un nuevo coordinador de tesis general
 *     tags: [Coordinador de Tesis]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del coordinador
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico institucional
 *               carnet:
 *                 type: string
 *                 description: Carnet del coordinador
 *     responses:
 *       201:
 *         description: Coordinador de tesis creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Ya existe un coordinador de tesis activo o usuario con ese correo/carnet
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/createCorThesis",
  authMiddleware,
  getUserIdToken,
  defineCoordinadorTesis,
  createCorThesis
);

/**
 * @swagger
 * /api/thesisCoordinator/list:
 *   get:
 *     summary: Listar todos los coordinadores de tesis
 *     tags: [Coordinador de Tesis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de coordinadores de tesis recuperada exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/thesisCoordinator/list",
  authMiddleware,
  getUserIdToken,
  defineCoordinadorTesis,
  listThesisCoordinators
);

/**
 * @swagger
 * /api/thesisCoordinator/update:
 *   put:
 *     summary: Editar la información de un coordinador de tesis
 *     tags: [Coordinador de Tesis]
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
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del coordinador de tesis
 *               name:
 *                 type: string
 *                 description: Nombre completo
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico institucional
 *               carnet:
 *                 type: string
 *                 description: Carnet
 *     responses:
 *       200:
 *         description: Coordinador de tesis actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Coordinador de tesis no encontrado
 *       409:
 *         description: Ya existe un usuario con ese correo/carnet
 *       500:
 *         description: Error del servidor
 */
router.put(
  "/thesisCoordinator/update",
  authMiddleware,
  getUserIdToken,
  defineCoordinadorTesis,
  updateThesisCoordinator
);



/**
 * @swagger
 * /api/thesisCoordinator/toggle:
 *   post:
 *     summary: Alterna el estado activo/inactivo de un coordinador de tesis (solo puede haber uno activo)
 *     tags: [Coordinador de Tesis]
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
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del coordinador de tesis
 *     responses:
 *       200:
 *         description: Estado de coordinador de tesis alternado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Coordinador de tesis no encontrado
 *       409:
 *         description: Ya existe un coordinador de tesis activo
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/thesisCoordinator/toggle",
  authMiddleware,
  getUserIdToken,
  defineCoordinadorTesis,
  require("../controllers/createCorThesisController").toggleThesisCoordinatorStatus
);

module.exports = router; 