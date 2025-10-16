const { Router } = require("express");
const router = Router();
const {
  createAssignedReview,
  getAssignedReviewsByUser,
} = require("../controllers/assignedReviewController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

// Middleware para verificar el rol de coordinador de tesis, Y coordinador general
const cordThesis = verifyRole([5, 6]);
const reviewAndCord = verifyRole([5, 6, 7]);

/**
 * @swagger
 * /api/assigned-review:
 *   post:
 *     summary: Asignar una revisión de tesis a un revisor
 *     description: Asigna una revisión de tesis a un revisor específico. El usuario debe tener el rol de revisor (rol_id === 7) y la revisión debe estar activa (active_process === true).
 *     tags:
 *       - Asignación de Revisiones
 *     security:
 *       - bearerAuth: []
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
router.post(
  "/assigned-review",
  authMiddleware,
  cordThesis,
  createAssignedReview
);

/**
 * @swagger
 * /api/assigned-review/user/{user_id}:
 *   get:
 *     summary: Obtener revisiones de tesis asignadas a un usuario
 *     description: Retorna todas las revisiones de tesis asignadas a un usuario específico con filtros opcionales.
 *     tags:
 *       - Asignación de Revisiones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario para obtener sus revisiones asignadas.
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de las revisiones por fecha de asignación (ascendente o descendente).
 *       - in: query
 *         name: carnet
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar revisiones por número de carnet del estudiante (búsqueda parcial).
 *     responses:
 *       200:
 *         description: Lista de revisiones asignadas al usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la asignación.
 *                       revision_thesis_id:
 *                         type: integer
 *                         description: ID de la revisión de tesis.
 *                       user_id:
 *                         type: integer
 *                         description: ID del revisor asignado.
 *                       assigned_at:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha y hora de asignación.
 *       400:
 *         description: ID de usuario inválido.
 *       404:
 *         description: No se encontraron revisiones asignadas para el usuario.
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  "/assigned-review/user/:user_id",
  authMiddleware,
  reviewAndCord,
  getAssignedReviewsByUser
);



module.exports = router;
