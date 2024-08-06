const express = require('express');
const { listarTareas, actualizarTarea } = require('../controllers/tareasController');
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const adminOrTerna = verifyRole([2,3]);

/**
 * @swagger
 * tags:
 *   - name: Tareas
 *     description: Operaciones de Tarea - get y put
 */



/**
 * @swagger
 * /api/tareas:
 *   get:
 *     summary: Lista todas las tareas
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna una lista de tareas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/tareas', authMiddleware, listarTareas);

/**
 * @swagger
 * /api/tareas/{tarea_id}:
 *   put:
 *     summary: Actualiza una tarea específica
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tarea_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título actualizado de la tarea
 *                 example: "CAPITULO 6"
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la tarea
 *                 example: "REALIZAR EL CAPÍTULO 6 DEL PROYECTO DE GRADUACIÓN"
 *               inicioTarea:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio de la tarea, opcional
 *                 example: null
 *               finTarea:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de finalización de la tarea, opcional
 *                 example: null
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Tarea no encontrada.
 *       500:
 *         description: Error al actualizar la tarea.
 */

router.put('/tareas/:tarea_id', authMiddleware, adminOrTerna, actualizarTarea);

module.exports = router;
