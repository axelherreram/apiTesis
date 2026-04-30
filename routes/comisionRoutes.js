const express = require("express");
const router = express.Router();
const {
  createGroupComision,
  removeUserFromComision,
  addUserToComision,
  getGroupsAndUsersBySedeAndYear,
} = require("../controllers/comisionController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3, 5]);

/**
 * @swagger
 * tags:
 *   name: Commissions
 *   description: Commission group management operations.
 */

/**
 * @swagger
 * /api/commissions/group:
 *   post:
 *     summary: Create a new commission group and assign members
 *     description: Creates a commission group and assigns users with specific roles.
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2024
 *               sede_id:
 *                 type: integer
 *                 example: 1
 *               groupData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 101
 *                     rol_comision_id:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Commission group created successfully
 *       500:
 *         description: Server error
 */
router.post(
  "/commissions/group",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  createGroupComision
);

/**
 * @swagger
 * /api/commissions/{group_id}/member/{user_id}:
 *   delete:
 *     summary: Remove a member from a commission group
 *     description: Removes a specific user from a commission group.
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Commission group ID
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       404:
 *         description: Member not found in commission
 *       500:
 *         description: Server error
 */
router.delete(
  "/commissions/:group_id/member/:user_id",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  removeUserFromComision
);

/**
 * @swagger
 * /api/commissions/{group_id}/member:
 *   post:
 *     summary: Add a member to an existing commission group
 *     description: Adds a user with a specific role to an existing commission group.
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Commission group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 15
 *               rol_comision_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Invalid user/role or member limit exceeded
 *       403:
 *         description: Access denied for this sede
 *       404:
 *         description: Commission group not found
 *       500:
 *         description: Server error
 */
router.post(
  "/commissions/:group_id/member",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  addUserToComision
);

/**
 * @swagger
 * /api/commissions/groups/{sede_id}/{year}:
 *   get:
 *     summary: Get commission groups by sede and year, including users and roles
 *     description: Returns all commission groups for a given sede and year, with their members and roles.
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sede ID
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year
 *     responses:
 *       200:
 *         description: Commission groups retrieved successfully
 *       404:
 *         description: No commission groups found
 *       500:
 *         description: Server error
 */
router.get(
  "/commissions/groups/:sede_id/:year",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  getGroupsAndUsersBySedeAndYear
);

module.exports = router;
