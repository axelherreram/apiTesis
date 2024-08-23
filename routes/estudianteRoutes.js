const express = require("express");
const router = express.Router();
const { cargarUsuariosMasivos } = require("../controllers/estudianteController");
const upload = require("../middlewares/uploadExcel"); 

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Operaciones para subir estudiantes por medio de un archivo Excel
 */

/**
 * @swagger
 * /api/estudiantes/cargaMasiva:
 *   post:
 *     summary: Cargar usuarios masivamente desde un archivo Excel
 *     tags: [Estudiantes]
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
 *               curso_id:
 *                 type: integer
 *                 description: ID del curso a asignar a los usuarios
 *                 required: true
 *     responses:
 *       201:
 *         description: Usuarios cargados exitosamente
 *       400:
 *         description: Error en la carga del archivo
 *       500:
 *         description: Error en el servidor
 */
router.post("/estudiantes/cargaMasiva", upload.single('archivo'), cargarUsuariosMasivos);

module.exports = router;
