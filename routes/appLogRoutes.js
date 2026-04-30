const express = require("express");
const {
  listAllLogs,
  listLogsByUser,
} = require("../controllers/appLogController");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");

const router = express.Router();

const allowed = verifyRole([3, 4, 5]);

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity log operations
 */

/**
 * @swagger
 * /api/logs/user/{user_id}:
 *   get:
 *     tags: [Logs]
 *     summary: List activity logs for a specific user
 *     description: Returns all activity log entries for the given user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID to retrieve logs for
 *     responses:
 *       200:
 *         description: List of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bitacora'
 *       404:
 *         description: No log entries found for this user
 *       500:
 *         description: Server error
 */
router.get("/logs/user/:user_id", authMiddleware, allowed, listLogsByUser);

/**
 * @swagger
 * /api/logs/{sede_id}:
 *   get:
 *     tags: [Logs]
 *     summary: List all activity logs for a sede
 *     description: Returns all activity log entries for the given sede.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sede ID to retrieve logs for
 *     responses:
 *       200:
 *         description: Full list of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bitacora'
 *       404:
 *         description: No log entries found
 *       500:
 *         description: Server error
 */
router.get(
  "/logs/:sede_id",
  authMiddleware,
  allowed,
  extractSedeIdMiddleware,
  getUserIdToken,
  listAllLogs
);

module.exports = router;
