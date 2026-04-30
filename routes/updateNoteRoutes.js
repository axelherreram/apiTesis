const express = require("express");
const router = express.Router();
const { updateNote, listNotes } = require("../controllers/updateNoteController");
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/roleMiddleware');

const admin = verifyRole([3]);
const allowedRolesList = verifyRole([3, 4, 5]);

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Endpoints for managing student grades.
 */

/**
 * @swagger
 * /api/grades/update:
 *   put:
 *     summary: Update a student's grade for a specific course.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
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
 *                 description: Student ID.
 *               course_id:
 *                 type: integer
 *                 example: 3
 *                 description: Course assignment ID (by sede and year).
 *               note:
 *                 type: number
 *                 format: float
 *                 example: 87.5
 *                 description: Grade to assign.
 *     responses:
 *       200:
 *         description: Grade updated successfully.
 *       400:
 *         description: Incomplete or invalid data.
 *       404:
 *         description: Student course assignment not found.
 *       500:
 *         description: Server error.
 */
router.put("/grades/update", authMiddleware, admin, updateNote);

/**
 * @swagger
 * /api/grades/list/{user_id}/{course_id}:
 *   get:
 *     summary: Get a student's grade for a specific course.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID.
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course assignment ID (by sede and year).
 *     responses:
 *       200:
 *         description: Student grade retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   type: number
 *                   format: float
 *                   example: 87.5
 *       400:
 *         description: Incomplete or invalid data.
 *       404:
 *         description: Assignment or grade not found.
 *       500:
 *         description: Server error.
 */
router.get("/grades/list/:user_id/:course_id", authMiddleware, allowedRolesList, listNotes);

module.exports = router;
