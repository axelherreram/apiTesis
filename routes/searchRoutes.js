const express = require("express");
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const router = express.Router();

const admin = verifyRole([3]); // Solo Admin

// Ruta para buscar estudiantes por carnet
/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Buscar estudiantes por carnet
 *     tags: [Busquedas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: carnet
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte o todo el carnet del estudiante para buscar
 *     responses:
 *       200:
 *         description: Lista de estudiantes que coinciden con la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Faltan parámetros obligatorios
 *         content:
 *           application/json:
 *             example:
 *               message: "El parámetro 'carnet' es obligatorio."
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error al buscar estudiantes."
 *               error: "Detalle del error"
 */
router.get(
  "/users/search",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  searchController.searchStudentByCarnet
);

// Ruta para buscar catedráticos por carnet
/**
 * @swagger
 * /api/professors/search:
 *   get:
 *     summary: Buscar catedráticos por carnet
 *     tags: [Busquedas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: carnet
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte o todo el carnet del catedrático para buscar
 *     responses:
 *       200:
 *         description: Lista de catedráticos que coinciden con la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Faltan parámetros obligatorios
 *         content:
 *           application/json:
 *             example:
 *               message: "El parámetro 'carnet' es obligatorio."
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error al buscar catedráticos."
 *               error: "Detalle del error"
 */
router.get(
  "/professors/search",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  searchController.searchProfessorByCarnet
);

// Ruta para buscar estudiantes por carnet (sin validación de sede)
/**
 * @swagger
 * /api/students/search:
 *   get:
 *     summary: Buscar estudiantes por carnet (sin validación de sede)
 *     tags: [Busquedas]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: query
 *         name: carnet
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte o todo el carnet del estudiante para buscar
 *     responses:
 *       200:
 *         description: Lista de estudiantes que coinciden con la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Faltan parámetros obligatorios
 *         content:
 *           application/json:
 *             example:
 *               message: "El parámetro 'carnet' es obligatorio."
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error al buscar estudiantes."
 *               error: "Detalle del error"
 */
router.get(
  "/students/search",
  authMiddleware, 
  admin,
  searchController.searchStudentByCarnetWithoutSede
);
module.exports = router;
