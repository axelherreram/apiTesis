const express = require('express');
const { listSede, createSede, editSede } = require('../controllers/sedeController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const getUserIdToken = require('../middlewares/getUserIdToken');

const router = express.Router();
const adminOrTerna = verifyRole([2, 3]);
const superAdmin = verifyRole([4]);

/**
 * @swagger
 * tags:
 *   name: Sede
 *   description: Gestión de sedes - operaciones para listar y crear sedes dentro del sistema.
 */

/**
 * @swagger
 * /api/sedes:
 *   get:
 *     summary: Lista todas las sedes
 *     tags: [Sede]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las sedes disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sede'
 *       500:
 *         description: Error interno del servidor al intentar recuperar las sedes.
 *   post:
 *     summary: Crea una nueva sede
 *     tags: [Sede]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sede'
 *     responses:
 *       201:
 *         description: Sede creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sede'
 *       400:
 *         description: Datos de entrada inválidos. Se requiere el nombre de la sede.
 *       500:
 *         description: Error interno del servidor al intentar crear la sede.
 */

/**
 * @swagger
 * /api/sedes/{sede_id}:
 *   put:
 *     summary: Edita el nombre de una sede
 *     tags: [Sede]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameSede:
 *                 type: string
 *                 example: "Nueva Sede"
 *                 description: Nuevo nombre de la sede
 *     responses:
 *       200:
 *         description: Sede actualizada satisfactoriamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sede actualizada satisfactoriamente"
 *       400:
 *         description: El nombre de la sede es necesario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El nombre de la sede es necesario"
 *       404:
 *         description: Sede no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sede no encontrada"
 *       500:
 *         description: Error al actualizar la sede.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al actualizar la sede"
 *                 error:
 *                   type: string
 */

router.get('/sedes', authMiddleware, listSede);
router.post('/sedes', authMiddleware, getUserIdToken, superAdmin, createSede);
router.put('/sedes/:sede_id', authMiddleware, getUserIdToken, superAdmin, editSede);

module.exports = router;