const express = require("express");
const {
  createSedeAssignment,
  getCoursesBySede,
} = require("../controllers/courseSedeAssignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const getUserIdToken = require("../middlewares/getUserIdToken");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

const coordinador_sede = verifyRole([4, 5]);
const adminOrSuperadmin = verifyRole([1, 3, 4, 5]);

/**
 * @swagger
 * tags:
 *   - name: CourseAssignments
 *     description: Course-to-sede assignment operations
 */

/**
 * @swagger
 * /api/course-assignments:
 *   post:
 *     summary: Create a course assignment for a sede
 *     tags: [CourseAssignments]
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
 *             properties:
 *               course_id:
 *                 type: integer
 *                 description: Course ID to assign
 *                 example: 1
 *               sede_id:
 *                 type: integer
 *                 description: Sede ID to assign the course to
 *                 example: 1
 *     responses:
 *       201:
 *         description: Course assignment created successfully
 *       400:
 *         description: Assignment error (wrong period, already exists, etc.)
 *       403:
 *         description: No permission to assign courses to this sede
 *       500:
 *         description: Server error
 */
router.post(
  "/course-assignments",
  authMiddleware,
  getUserIdToken,
  coordinador_sede,
  createSedeAssignment
);

/**
 * @swagger
 * /api/courses/by-location/{sede_id}/{year}:
 *   get:
 *     summary: Get courses assigned to a sede for a given year
 *     tags: [CourseAssignments]
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
 *         description: Courses for the sede retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseSedeAssignment'
 *       404:
 *         description: No courses found for this sede
 *       500:
 *         description: Server error
 */
router.get(
  "/courses/by-location/:sede_id/:year",
  authMiddleware,
  getUserIdToken,
  adminOrSuperadmin,
  extractSedeIdMiddleware,
  getCoursesBySede
);

module.exports = router;
