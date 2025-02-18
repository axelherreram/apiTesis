const { Router } = require("express");
const {
  uploadRevisionThesis,
  getPendingRevisions,
  getRevisionsByUserId
} = require("../controllers/revisionThesisController");
const uploadFilesMiddleware = require("../middlewares/revisionFilesMiddleware");

const router = Router();

/**
 * @swagger
 * /api/revision-thesis:
 *   post:
 *     summary: Subir una revisión de tesis
 *     description: Permite a un estudiante subir su revisión de tesis junto con la carta de aprobación.
 *     tags:
 *       - Revisión de Tesis
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que sube la revisión.
 *                 example: 1
 *               sede_id:
 *                 type: integer
 *                 description: ID de la sede donde se sube la revisión.
 *                 example: 2
 *               approval_letter:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de la carta de aprobación en formato PDF.
 *               thesis:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de la tesis en formato PDF.
 *     responses:
 *       201:
 *         description: Revisión de tesis creada con éxito.
 *       400:
 *         description: Se requieren ambos archivos (carta de aprobación y tesis).
 *       404:
 *         description: Usuario o sede no encontrados.
 *       409:
 *         description: El usuario ya tiene un proceso de revisión activo.
 *       500:
 *         description: Error al subir la revisión de tesis.
 */
router.post("/revision-thesis", uploadFilesMiddleware, uploadRevisionThesis);

/**
 * @swagger
 * /api/revision-thesis/pending:
 *   get:
 *     summary: Obtener revisiones pendientes sin asignar
 *     description: Obtiene una lista de revisiones de tesis pendientes que no han sido asignadas a un revisor.
 *     tags:
 *       - Revisión de Tesis
 *     parameters:
 *       - in: query
 *         name: order
 *         type: string
 *         description: Orden de los resultados (asc o desc).
 *         default: asc
 *       - in: query
 *         name: carnet
 *         type: string
 *         description: Carnet del estudiante para filtrar las revisiones.
 *       - in: query
 *         name: name
 *         type: string
 *         description: Nombre del estudiante para filtrar las revisiones.
 *     responses:
 *       200:
 *         description: Lista de revisiones pendientes sin asignar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Revisiones de tesis pendientes sin asignar obtenidas con éxito
 *                 orden:
 *                   type: string
 *                   example: asc
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       revision_thesis_id:
 *                         type: integer
 *                         example: 1
 *                       thesis_dir:
 *                         type: string
 *                         example: http://localhost:3000/path/to/thesis.pdf
 *                       date_revision:
 *                         type: string
 *                         format: date
 *                         example: 2023-10-01
 *                       status:
 *                         type: string
 *                         example: pending
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Juan Perez
 *                           carnet:
 *                             type: string
 *                             example: 12345
 *       404:
 *         description: No hay revisiones de tesis pendientes sin asignar.
 *       500:
 *         description: Error al obtener las revisiones pendientes.
 */
router.get("/revision-thesis/pending", getPendingRevisions);


router.get("/revision-thesis/user/:user_id", getRevisionsByUserId);
module.exports = router;