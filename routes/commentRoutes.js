const express = require("express");
const { addCommentForTask, getAllCommentsForTaskAndUser } = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const adminOrStudent = verifyRole([3]); // Permitir solo a usuarios con rol de administrador

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comentarios
 *   description: Gestión de comentarios y versiones relacionados con tareas.
 */

/**
 * @swagger
 * /api/comments/{taskId}:
 *   post:
 *     tags:
 *       - Comentarios
 *     summary: Agregar un nuevo comentario a una tarea.
 *     description: Permite agregar un comentario a una tarea específica, creando una nueva versión del comentario si es necesario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID de la tarea.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: El texto del comentario.
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *                 description: Rol del usuario que realiza el comentario.
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que realiza el comentario.
 *             required:
 *               - comment
 *               - role
 *               - user_id
 *     responses:
 *       "201":
 *         description: Comentario agregado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comentario agregado exitosamente.
 *       "400":
 *         description: Parámetros inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       "500":
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post("/comments/:taskId", authMiddleware, addCommentForTask);

/**
 * @swagger
 * /api/comments/{taskId}/user/{userId}:
 *   get:
 *     tags:
 *       - Comentarios
 *     summary: Obtener comentarios de una tarea para un usuario específico.
 *     description: Recupera todos los comentarios y versiones relacionadas con una tarea y un usuario específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID de la tarea.
 *         schema:
 *           type: integer
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario.
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: Lista de comentarios obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       comment_id:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           profilePhoto:
 *                             type: string
 *                             nullable: true
 *                       comment:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [student, teacher]
 *                       datecomment:
 *                         type: string
 *                         format: date-time
 *       "404":
 *         description: No se encontraron comentarios para la tarea y el usuario proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No comments found for this task and user.
 *       "500":
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/comments/:taskId/user/:userId", authMiddleware, getAllCommentsForTaskAndUser);

module.exports = router;
