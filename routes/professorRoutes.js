const express = require("express");
const { createProfessor } = require("../controllers/professorController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const obtenerUserIdDeToken = require("../middlewares/obtenerUserIdDeToken");
const router = express.Router();

const admin = verifyRole([3]); // Solo Admin

/**
 * @swagger
 * /api/create/professor:
 *   post:
 *     summary: Crear un nuevo catedrático (professor)
 *     description: Crea un nuevo catedrático y genera una contraseña aleatoria. Verifica si el correo ya está registrado.
 *     tags:
 *       - Professor
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
 *                 description: Correo del catedrático.
 *                 example: professor@universidad.edu
 *               name:
 *                 type: string
 *                 description: Nombre del catedrático.
 *                 example: Juan Pérez
 *               carnet:
 *                 type: string
 *                 description: Carnet del catedrático.
 *                 example: 123456
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede.
 *                 example: 1
 *               year:
 *                 type: integer
 *                 description: Año actual.
 *                 example: 2024
 *     responses:
 *       201:
 *         description: Catedrático creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Catedrático creado exitosamente.
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: Correo del catedrático.
 *                       example: professor@universidad.edu
 *                     name:
 *                       type: string
 *                       description: Nombre del catedrático.
 *                       example: Juan Pérez
 *                     carnet:
 *                       type: string
 *                       description: Carnet del catedrático.
 *                       example: 123456
 *       400:
 *         description: El usuario con el correo ya está registrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El usuario con el correo ya está registrado.
 *       500:
 *         description: Error en el servidor al crear el catedrático.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error en el servidor al crear el catedrático.
 */
router.post("/create/professor", authMiddleware, obtenerUserIdDeToken, admin, createProfessor);

module.exports = router;
