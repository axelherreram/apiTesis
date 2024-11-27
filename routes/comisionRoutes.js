const express = require("express");
const router = express.Router();
const {
  createGroupComision,
  removeUserFromComision,
  addUserToComision,
  getGroupsAndUsersBySedeAndYear, // Importar la nueva función
} = require("../controllers/comisionController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const extractSedeIdMiddleware = require("../middlewares/extractSedeIdMiddleware");

const admin = verifyRole([3]); // Permitir solo a usuarios con rol de administrador

/**
 * @swagger
 * tags:
 *   name: Comisiones
 *   description: Operaciones relacionadas con comisiones y grupos de comisión.
 */

/**
 * @swagger
 * /api/comisiones/grupo:
 *   post:
 *     summary: Crear un nuevo grupo de comisión y asignar usuarios
 *     description: Crea un grupo de comisión y asigna usuarios con roles específicos.
 *     tags: [Comisiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2024
 *               sede_id:
 *                 type: integer
 *                 example: 1
 *               groupData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 101
 *                     rol_comision_id:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Grupo de comisión creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Grupo de comisión creado exitosamente
 *                 group:
 *                   $ref: '#/components/schemas/Comisiones'
 *       500:
 *         description: Error en el servidor
 */
router.post("/comisiones/grupo", authMiddleware, admin, extractSedeIdMiddleware, createGroupComision);

/**
 * @swagger
 * /api/comisiones/{group_id}/usuario/{user_id}:
 *   delete:
 *     summary: Eliminar un usuario de una comisión
 *     description: Elimina un usuario específico de una comisión dentro de un grupo.
 *     tags: [Comisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo de comisión
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente de la comisión
 *       404:
 *         description: Usuario no encontrado en la comisión
 *       500:
 *         description: Error en el servidor
 */
router.delete("/comisiones/:group_id/usuario/:user_id", authMiddleware, admin, extractSedeIdMiddleware, removeUserFromComision);

/**
 * @swagger
 * /api/comisiones/{group_id}/usuario:
 *   post:
 *     summary: Agregar un usuario a una comisión existente
 *     description: Agrega un usuario con un rol específico a un grupo de comisión existente.
 *     tags: [Comisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo de comisión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que se va a agregar
 *                 example: 15
 *               rol_comision_id:
 *                 type: integer
 *                 description: ID del rol asignado al usuario dentro de la comisión
 *                 example: 3
 *     responses:
 *       201:
 *         description: Usuario agregado exitosamente a la comisión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario agregado a la comisión exitosamente
 *                 comision:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: integer
 *                       example: 1
 *                     year_id:
 *                       type: integer
 *                       example: 2024
 *                     sede_id:
 *                       type: integer
 *                       example: 2
 *                     user_id:
 *                       type: integer
 *                       example: 15
 *                     rol_comision_id:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: Grupo de comisión no encontrado
 *       400:
 *         description: Usuario o rol de comisión no válido o límite de usuarios excedido
 *       403:
 *         description: No tienes acceso para esta sede
 *       500:
 *         description: Error en el servidor
 */
router.post(
  "/comisiones/:group_id/usuario",
  authMiddleware,
  admin,
  extractSedeIdMiddleware,
  addUserToComision
);

/**
 * @swagger
 * /api/comisiones/grupos/{sede_id}/{year}:
 *   get:
 *     summary: Obtener los grupos de comisión por sede y año, junto con los usuarios y roles
 *     description: Obtiene todos los grupos de comisión por sede y año, junto con los usuarios y sus roles asociados.
 *     tags: [Comisiones]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: path
 *         name: sede_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año de los grupos de comisión
 *     responses:
 *       200:
 *         description: Grupos de comisión obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       group_id:
 *                         type: integer
 *                         example: 1
 *                       year_id:
 *                         type: integer
 *                         example: 2024
 *                       sede_id:
 *                         type: integer
 *                         example: 1
 *                       users:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             user_id:
 *                               type: integer
 *                               example: 123
 *                             email:
 *                               type: string
 *                               example: usuario@dominio.com
 *                             nombre:
 *                               type: string
 *                               example: Juan Pérez
 *                             rol:
 *                               type: string
 *                               example: Profesor
 *                             profilePhoto:
 *                               type: string
 *                               example: "http://localhost:3000/public/fotoPerfil/juan.jpg"
 *       404:
 *         description: No se encontraron grupos de comisión
 *       500:
 *         description: Error en el servidor
 */
router.get("/comisiones/grupos/:sede_id/:year", authMiddleware, admin, extractSedeIdMiddleware, getGroupsAndUsersBySedeAndYear);

module.exports = router;
