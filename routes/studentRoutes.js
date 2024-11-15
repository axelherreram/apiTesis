const express = require("express");
const router = express.Router();
const { bulkUploadUsers } = require("../controllers/studentController");
const upload = require("../middlewares/uploadExcel");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const admin = verifyRole([3]); // Solo Admin

/**
 * @swagger
 * tags:
 *   name: Subir usuarios por Excel
 *   description: Operaciones para subir usuarios por medio de un archivo Excel
 */

/**
 * @swagger
 * /api/usuarios/cargaMasiva:
 *   post:
 *     summary: Cargar usuarios masivamente desde un archivo Excel
 *     security:
 *       - bearerAuth: []
 *     tags: [Subir usuarios por Excel]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/BulkUpload'
 *     responses:
 *       201:
 *         description: Usuarios cargados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la carga del archivo
 *       500:
 *         description: Error en el servidor
 */
router.post(
  "/usuarios/cargaMasiva",
  authMiddleware,
  admin,
  upload.single("archivo"),
  bulkUploadUsers
);

module.exports = router;
