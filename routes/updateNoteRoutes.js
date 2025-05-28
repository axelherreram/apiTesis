const express = require("express");
const router = express.Router();
const { updateNote, listNotes } = require("../controllers/updateNoteController");
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/roleMiddleware');

// Define roles for routes
const admin = verifyRole([3]);
const allowedRolesList = verifyRole([3, 4, 5]);

/**
 * @swagger
 * tags:
 *   name: Notas
 *   description: Endpoints para gestionar notas de estudiantes.
 */

/**
 * @swagger
 * /api/notas/update:
 *   put:
 *     summary: Actualiza la nota de un estudiante en un curso específico.
 *     tags:
 *       - Notas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - course_id
 *               - note
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 5
 *                 description: ID del estudiante.
 *               course_id:
 *                 type: integer
 *                 example: 3
 *                 description: ID de la asignación del curso (por sede y año).
 *               note:
 *                 type: number
 *                 format: float
 *                 example: 87.5
 *                 description: Nota a asignar al estudiante.
 *     responses:
 *       200:
 *         description: Nota actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nota actualizada exitosamente.
 *       400:
 *         description: Datos incompletos o inválidos.
 *       404:
 *         description: Asignación del estudiante al curso no encontrada.
 *       500:
 *         description: Error del servidor al actualizar la nota.
 */

router.put("/notas/update", authMiddleware, admin, updateNote);

/**
 * @swagger
 * /api/notas/list/{user_id}/{course_id}:
 *   get:
 *     summary: Lista la nota de un estudiante para un curso específico.
 *     tags:
 *       - Notas
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante.
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación del curso (por sede y año).
 *     responses:
 *       200:
 *         description: Nota del estudiante obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   type: number
 *                   format: float
 *                   example: 87.5
 *                   description: Nota del estudiante.
 *       400:
 *         description: Datos incompletos o inválidos.
 *       404:
 *         description: Asignación del estudiante al curso no encontrada o nota no registrada.
 *       500:
 *         description: Error del servidor al listar la nota.
 */
router.get("/notas/list/:user_id/:course_id", authMiddleware, allowedRolesList, listNotes);

module.exports = router;
