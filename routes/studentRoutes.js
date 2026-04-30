const express = require("express");
const router = express.Router();
const { bulkUploadUsers } = require("../controllers/studentController");
const { bulkUploadCatedratico } = require("../controllers/catedraticoController");
const upload = require("../middlewares/uploadExcel");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]);
const coordinador_sede = verifyRole([4]);

/**
 * @swagger
 * tags:
 *   name: BulkUpload
 *   description: Bulk upload operations for students and professors via Excel files
 */

/**
 * @swagger
 * /api/students/bulk-upload:
 *   post:
 *     summary: Bulk upload students from an Excel file
 *     security:
 *       - bearerAuth: []
 *     tags: [BulkUpload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - sede_id
 *               - course_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing student data.
 *               sede_id:
 *                 type: integer
 *                 description: Sede ID the students belong to.
 *               course_id:
 *                 type: integer
 *                 description: Course ID to assign the students to.
 *     responses:
 *       201:
 *         description: Students uploaded successfully
 *       400:
 *         description: File upload error or missing required fields
 *       500:
 *         description: Server error
 */
router.post(
  "/students/bulk-upload",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  upload.single("archivo"),
  bulkUploadUsers
);

/**
 * @swagger
 * /api/professors/bulk-upload:
 *   post:
 *     summary: Bulk upload professors from an Excel file
 *     security:
 *       - bearerAuth: []
 *     tags: [BulkUpload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - sede_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing professor data.
 *               sede_id:
 *                 type: integer
 *                 description: Sede ID the professors belong to.
 *     responses:
 *       201:
 *         description: Professors uploaded successfully
 *       400:
 *         description: File upload error or missing required fields
 *       500:
 *         description: Server error
 */
router.post(
  "/professors/bulk-upload",
  authMiddleware,
  coordinador_sede,
  extractSedeIdMiddleware,
  upload.single("archivo"),
  bulkUploadCatedratico
);

module.exports = router;
