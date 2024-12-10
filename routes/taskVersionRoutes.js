const express = require("express");
const {
  getAllCommentsForTask,
  addCommentForTask,
} = require("../controllers/taskVersionController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const adminOrStudent = verifyRole([1, 3]);
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Versiones de tareas  
 *   description: Versiones de tareas, comentarios.
 */

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: Get all comments for a task.
 *     tags: [Versiones de tareas   ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of comments for the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: integer
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       version_id:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           profilePhoto:
 *                             type: string
 *                       comment:
 *                         type: string
 *                       role:
 *                         type: string
 *                       date_comment:
 *                         type: string
 *                         format: date-time
 *                       parent_comment_id:
 *                         type: integer
 *                         nullable: true
 *       404:
 *         description: No comments found for the task.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/tasks/:taskId/comments",
  authMiddleware,
  adminOrStudent,
  getAllCommentsForTask
);

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a new comment to a task.
 *     tags: [Versiones de tareas   ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task.
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
 *                 example: "Please revise the introduction."
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *               parent_comment_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Comment added successfully.
 *       400:
 *         description: Missing required fields or invalid role.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/tasks/:taskId/comments",
  authMiddleware,
  adminOrStudent,
  addCommentForTask
);

module.exports = router;
