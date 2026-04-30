const express = require("express");
const {
  listTasks,
  listTask,
  updateTask,
  listTasksByCourse,
  createTask,
  listInfoTaksByUser,
} = require("../controllers/taskController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management operations
 */

/**
 * @swagger
 * /api/tasks/{sede_id}/{year}:
 *   get:
 *     summary: List all tasks for a sede and year
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sede ID
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Year
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/tasks/:sede_id/:year",
  authMiddleware,
  getUserIdToken,
  listTasks
);

/**
 * @swagger
 * /api/tasks/{task_id}:
 *   get:
 *     summary: Get task details by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Unique task ID
 *     responses:
 *       200:
 *         description: Task found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     task_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     taskStart:
 *                       type: string
 *                       format: date-time
 *                     endTask:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid or missing task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get(
  "/tasks/:task_id",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  listTask
);

/**
 * @swagger
 * /api/tasks/course/{sede_id}/{course_id}/{year}:
 *   get:
 *     summary: List tasks for a specific course
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sede ID
 *       - in: path
 *         name: course_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Course ID
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Course year
 *     responses:
 *       200:
 *         description: List of tasks for the given course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: No tasks found
 *       500:
 *         description: Server error
 */
router.get(
  "/tasks/course/:sede_id/:course_id/:year",
  authMiddleware,
  getUserIdToken,
  listTasksByCourse
);

/**
 * @swagger
 * /api/tasks/{task_id}:
 *   put:
 *     summary: Update a specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 example: Updated task description
 *               taskStart:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-11-27T09:00:00Z
 *               endTask:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-11-28T17:00:00Z
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put(
  "/tasks/:task_id",
  authMiddleware,
  getUserIdToken,
  admin,
  extractSedeIdMiddleware,
  updateTask
);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - sede_id
 *               - typeTask_id
 *               - title
 *               - description
 *               - taskStart
 *               - endTask
 *             properties:
 *               course_id:
 *                 type: integer
 *                 description: Related course ID
 *               sede_id:
 *                 type: integer
 *                 description: Related sede ID
 *               typeTask_id:
 *                 type: integer
 *                 description: Task type (1 = thesis proposal, etc.)
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Detailed task description
 *               taskStart:
 *                 type: string
 *                 format: date-time
 *                 description: Task start datetime
 *               endTask:
 *                 type: string
 *                 format: date-time
 *                 description: Task end datetime
 *           example:
 *             course_id: 1
 *             sede_id: 1
 *             typeTask_id: 1
 *             title: "CHAPTER 3"
 *             description: "Complete chapter 3 of the research project"
 *             taskStart: "2024-09-15T08:00:00Z"
 *             endTask: "2024-09-20T12:00:00Z"
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Access denied
 *       404:
 *         description: Related record not found
 *       500:
 *         description: Server error
 */
router.post(
  "/tasks",
  authMiddleware,
  getUserIdToken,
  admin,
  extractSedeIdMiddleware,
  createTask
);

module.exports = router;
