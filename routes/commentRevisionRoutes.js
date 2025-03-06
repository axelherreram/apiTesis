const express = require("express");
const {
  createCommentRevision,
} = require("../controllers/commentRevisionController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const router = express.Router();
const getUseridMiddleware = require('../middlewares/getUserIdToken');
const cordThesis = verifyRole([6, 7]);

/**
 * @swagger
 * /api/comment-revision:
 *   post:
 *     summary: Crea un comentario en la revisión de una tesis
 *     description: Permite a un usuario agregar un comentario sobre la revisión de una tesis, actualizando el estado de aprobación y desactivando el proceso de revisión.
 *     tags:
 *       - Comentarios de Revisión de Tesis
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
 *               - title
 *               - comment
 *               - status
 *             properties:
 *               revision_thesis_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID de la revisión asignada a la que pertenece el comentario.
 *               title:
 *                 type: string
 *                 example: "Corrección en la introducción"
 *                 description: Título del comentario.
 *               comment:
 *                 type: string
 *                 example: "Es necesario mejorar la redacción en la introducción."
 *                 description: Contenido del comentario.
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 0
 *                 description: Estado de la revisión después del comentario (0 = rechazado, 1 = aprobado).
 *     responses:
 *       201:
 *         description: Comentario creado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comentario creado con éxito"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assigned_review_id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Corrección en la introducción"
 *                     comment:
 *                       type: string
 *                       example: "Es necesario mejorar la redacción en la introducción."
 *       400:
 *         description: Faltan campos requeridos o estado inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todos los campos son requeridos: assigned_review_id, title, comment, status"
 *       404:
 *         description: Revisión asignada no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Revisión asignada no encontrada"
 *       500:
 *         description: Error en el servidor al intentar crear el comentario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al crear el comentario"
 */

router.post(
  "/comment-revision",
  authMiddleware,
  getUseridMiddleware,
  cordThesis,
  createCommentRevision
);

module.exports = router;
