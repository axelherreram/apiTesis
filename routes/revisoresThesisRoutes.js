const { Router } = require("express");
const {
  createRevisor,
  getRevisores,
} = require("../controllers/revisoresThesisController");

const router = Router();

/**
 * @swagger
 * /api/reviewers:
 *   post:
 *     summary: Crea un nuevo revisor con una contraseña aleatoria.
 *     tags:
 *       - Revisores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - codigo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo del revisor
 *               name:
 *                 type: string
 *                 description: Nombre del revisor
 *               codigo:
 *                 type: string
 *                 description: Código o carnet del revisor
 *     responses:
 *       201:
 *         description: Revisor creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nuevo revisor creado con éxito"
 *                 password:
 *                   type: string
 *                   example: "a1b2c3d4e5f6g7h8"
 *       500:
 *         description: Error al crear el revisor
 */
router.get("/reviewers", getRevisores);

/**
 * @swagger
 * /api/reviewers:
 *   get:
 *     summary: Obtiene la lista de revisores registrados en el sistema.
 *     tags:
 *       - Revisores
 *     responses:
 *       200:
 *         description: Lista de revisores obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "revisor@example.com"
 *                   name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   carnet:
 *                     type: string
 *                     example: "20230001"
 *                   rol_id:
 *                     type: integer
 *                     example: 7
 *       404:
 *         description: No se encontraron revisores.
 *       500:
 *         description: Error al obtener los revisores.
 */
router.post("/reviewers", createRevisor);

module.exports = router;    

