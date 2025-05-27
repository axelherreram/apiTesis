const express = require("express");
const router = express.Router();
const { updateNote } = require("../controllers/updateNoteController");

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

router.put("/notas/update", updateNote);

module.exports = router;
