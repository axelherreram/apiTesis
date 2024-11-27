const express = require("express");
const router = express.Router();
const {
  updateProfessorStatus,
  listProfessors,
  listActiveProfessors,
  createProfessor,
} = require("../controllers/professorController");
const authMiddleware = require("../middlewares/authMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]); // Solo Admin

/**
 * @swagger
 * tags:
 *   name: Professors
 *   description: Operaciones relacionadas con los profesores
 */

/**
 * @swagger
 * /api/professors:
 *   get:
 *     summary: Listar todos los profesores
 *     description: Obtiene una lista de todos los usuarios con el rol de profesor (rol_id = 2) filtrados por sede_id.
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sede_id
 *         required: true
 *         description: ID de la sede para filtrar los profesores
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         description: Año para la solicitud
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de profesores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: El parámetro sede_id es obligatorio
 *       500:
 *         description: Error al obtener usuarios
 */
router.get("/professors", authMiddleware, admin, extractSedeIdMiddleware, listProfessors);

/**
 * @swagger
 * /api/professors/activos:
 *   get:
 *     summary: Listar todos los profesores activos
 *     description: Obtiene una lista de todos los usuarios con el rol de profesor (rol_id = 2) que estén activos, filtrados por sede_id.
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sede_id
 *         required: true
 *         description: ID de la sede para filtrar los profesores activos
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         description: Año para la solicitud
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de profesores activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: El parámetro sede_id es obligatorio
 *       500:
 *         description: Error al obtener usuarios
 */
router.get("/professors/activos", authMiddleware, admin, extractSedeIdMiddleware, listActiveProfessors);

/**
 * @swagger
 * /api/professors/{user_id}/status:
 *   patch:
 *     summary: Actualizar el estado active de un usuario
 *     description: Permite actualizar el campo active de un usuario específico.
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado active actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor al actualizar el campo active
 */
router.patch("/professors/:user_id/status", authMiddleware, admin, extractSedeIdMiddleware, updateProfessorStatus);

/**
 * @swagger
 * /api/create/professor:
 *   post:
 *     summary: Crear un nuevo profesor
 *     description: Crea un nuevo profesor y genera una contraseña aleatoria. Verifica si el correo ya está registrado.
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []  # Autenticación con token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del profesor.
 *                 example: profesor@miumg.edu.gt
 *               name:
 *                 type: string
 *                 description: Nombre completo del profesor.
 *                 example: Juan Pérez
 *               carnet:
 *                 type: string
 *                 description: Número de carnet del profesor.
 *                 example: 123456
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede en la que trabaja el profesor.
 *                 example: 1
 *               year:
 *                 type: integer
 *                 description: Año en que el profesor será asignado.
 *                 example: 2024
 *     responses:
 *       201:
 *         description: Profesor creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profesor creado exitosamente.
 *       400:
 *         description: El usuario con el correo ya está registrado.
 *       500:
 *         description: Error en el servidor al crear el profesor.
 */

router.post("/create/professor", authMiddleware, obtenerUserIdDeToken, admin, extractSedeIdMiddleware, createProfessor);

module.exports = router;
