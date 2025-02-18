const { Router } = require("express");
const router = Router();
const { createAssignedReview } = require("../controllers/assignedReviewController");

/**
 * @swagger
 * /api/assigned-review:
 *   post:
 *     summary: Asignar una revisión de tesis a un revisor
 *     description: Asigna una revisión de tesis a un revisor específico. El usuario debe tener el rol de revisor (rol_id === 7) y la revisión debe estar activa (active_process === true).
 *     tags:
 *       - Asignación de Revisiones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - revision_thesis_id
 *               - user_id
 *             properties:
 *               revision_thesis_id:
 *                 type: integer
 *                 description: ID de la revisión de tesis a asignar.
 *               user_id:
 *                 type: integer
 *                 description: ID del revisor al que se asignará la revisión.
 *     responses:
 *       201:
 *         description: Revisión asignada con éxito.
 *       400:
 *         description: Error en la solicitud (usuario no es revisor, revisión no está activa).
 *       404:
 *         description: Recurso no encontrado (usuario o revisión no encontrados).
 *       409:
 *         description: Conflicto (la revisión ya tiene un revisor asignado).
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/assigned-review", createAssignedReview); // Quita el prefijo /api

module.exports = router;