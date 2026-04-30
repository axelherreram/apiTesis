const express = require("express");
const { getStudentsComisionByYear } = require("../controllers/studentComisionController");
const verifyRole = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3, 5]);

/**
 * @swagger
 * tags:
 *   - name: CommissionStudents
 *     description: Operations related to students in commission groups
 *
 * /api/commissions/students/{year}/{sede_id}:
 *   get:
 *     summary: Get students by year and sede
 *     description: Returns students belonging to a commission for a specific year and sede.
 *     tags:
 *       - CommissionStudents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Students retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: No students found.
 */
router.get(
  "/commissions/students/:year/:sede_id",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  getStudentsComisionByYear
);

module.exports = router;
