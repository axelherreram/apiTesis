const express = require("express");
const router = express.Router();
const { bulkUploadUsers } = require("../controllers/studentController");
const { bulkUploadCatedratico } = require("../controllers/catedraticoController");
const upload = require("../middlewares/uploadExcel");
const verifyRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]); // Solo Admin
const coordinador_sede = verifyRole([4]); // Solo cordinador de sede
/**
 * @swagger
 * tags:
 *   name: Carga masiva de usuarios
 *   description: Operaciones para subir estudiantes y catedráticos por medio de un archivo Excel
 */

/**
 * @swagger
 * /api/usuarios/cargaMasiva:
 *   post:
 *     summary: Cargar estudiantes masivamente desde un archivo Excel
 *     security:
 *       - bearerAuth: []
 *     tags: [Carga masiva de usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: El archivo Excel que contiene los datos de los estudiantes.
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede a la que pertenece el estudiante.
 *               course_id:
 *                 type: integer
 *                 description: ID del curso al que se asignan los estudiantes.
 *             required:
 *               - archivo
 *               - sede_id
 *               - course_id
 *     responses:
 *       201:
 *         description: Estudiantes cargados exitosamente
 *       400:
 *         description: Error en la carga del archivo o campos requeridos faltantes
 *       500:
 *         description: Error al cargar usuarios
 */
router.post(
  "/usuarios/cargaMasiva",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  upload.single("archivo"),
  bulkUploadUsers
);

/**
 * @swagger
 * /api/catedraticos/cargaMasiva:
 *   post:
 *     summary: Cargar catedráticos masivamente desde un archivo Excel
 *     security:
 *       - bearerAuth: []
 *     tags: [Carga masiva de usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: El archivo Excel que contiene los datos de los catedráticos.
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede a la que pertenece el catedrático.
 *             required:
 *               - archivo
 *               - sede_id
 *     responses:
 *       201:
 *         description: Catedráticos cargados exitosamente
 *       400:
 *         description: Error en la carga del archivo o campos requeridos faltantes
 *       500:
 *         description: Error al cargar usuarios
 */
router.post(
  "/catedraticos/cargaMasiva",
  authMiddleware,
  coordinador_sede,
  extractSedeIdMiddleware,
  upload.single("archivo"),
  bulkUploadCatedratico
);

module.exports = router;
