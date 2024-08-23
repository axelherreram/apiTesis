const express = require("express");
const router = express.Router();
const { cargarTernasMasivas } = require("../controllers/ternaControllerEx");
const upload = require("../middlewares/uploadExcel"); 

/**
 * @swagger
 * tags:
 *   name: Ternas
 *   description: Operaciones para subir ternas por medio de un archivo Excel
 */

/**
 * @swagger
 * /api/ternas/cargaMasiva:
 *   post:
 *     summary: Cargar ternas masivamente desde un archivo Excel
 *     tags: [Ternas]
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
 *                 description: Archivo Excel con las ternas
 *                 required: true
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede a asignar a las ternas
 *                 required: true
 *     responses:
 *       201:
 *         description: Ternas cargadas exitosamente
 *       400:
 *         description: Error en la carga del archivo
 *       500:
 *         description: Error en el servidor
 */
router.post("/ternas/cargaMasiva", upload.single('archivo'), cargarTernasMasivas);

module.exports = router;
