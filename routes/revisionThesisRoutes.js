const { Router } = require("express");
const {
  uploadRevisionThesis,
  getPendingRevisions,
  getRevisionsByUserId,
  getRevisionsInReview, // Nuevo controlador
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
 *               carnet:
 *                 type: string
 *                 description: Carnet del estudiante que sube la revisión.
 *                 example: 1290-20-12345
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
/**
 * @swagger
 * /api/revision-thesis/in-review:
 *   get:
 *     summary: Obtener revisiones en revisión con revisor asignado
 *     description: Obtiene una lista de revisiones de tesis que están en estado "in revision" y tienen un revisor asignado.
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
 *     responses:
 *       200:
 *         description: Lista de revisiones en revisión con revisor asignado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Revisiones en revisión con revisor asignado obtenidas con éxito
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
 *                       date_revision:
 *                         type: string
 *                         format: date
 *                         example: 2023-10-01
 *                       status:
 *                         type: string
 *                         example: in revision
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Juan Perez
 *                           carnet:
 *                             type: string
 *                             example: 12345
 *                       reviewer:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Maria Lopez
 *                           carnet:
 *                             type: string
 *                             example: 67890
 *       404:
 *         description: No hay revisiones en revisión con revisor asignado.
 *       500:
 *         description: Error al obtener las revisiones en revisión.
 */
router.get("/revision-thesis/in-review", getRevisionsInReview);

/**
 * @swagger
 * /api/revision-thesis/user/{user_id}:
 *   get:
 *     summary: Obtener revisiones pendientes sin asignar de un estudiante
 *     description: Obtiene las revisiones de tesis pendientes sin asignar de un estudiante específico.
 *     tags:
 *       - Revisión de Tesis
 *     parameters:
 *       - in: path
 *         name: user_id
 *         type: integer
 *         required: true
 *         description: ID del usuario (estudiante) para obtener sus revisiones.
 *     responses:
 *       200:
 *         description: Lista de revisiones pendientes sin asignar del estudiante.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Revisiones pendientes sin asignar del estudiante obtenidas con éxito
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
 *         description: No se encontraron revisiones para el estudiante.
 *       500:
 *         description: Error al obtener las revisiones del estudiante.
 */
router.get("/revision-thesis/user/:user_id", getRevisionsByUserId);

module.exports = router;