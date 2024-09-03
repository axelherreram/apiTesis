const express = require("express");
const router = express.Router();
const {
  bulkUploadUsers,
} = require("../controllers/studentController");
const upload = require("../middlewares/uploadExcel");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const admin = verifyRole([3]);

/**
 * @swagger
 * tags:
 *   name: UsuariosXexcel
 *   description: Operaciones para subir Usuarios por medio de un archivo Excel
 */

/**
 * @swagger
 * /api/usuarios/cargaMasiva:
 *   post:
 *     summary: Cargar usuarios masivamente desde un archivo Excel
*     security:
 *       - bearerAuth: []
 *     tags: [UsuariosXexcel]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo Excel con los usuarios
 *                 required: true
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede a asignar a los usuarios
 *                 required: true
 *               rol_id:
 *                 type: integer
 *                 description: ID del rol a asignar a los usuarios
 *                 required: true
 *               course_id:
 *                 type: integer
 *                 description: ID del curso a asignar a los usuarios (opcional)
 *     responses:
 *       201:
 *         description: Usuarios cargados exitosamente
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
