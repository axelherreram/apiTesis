const express = require("express");
const router = express.Router();
const {
  createGroupComision,
  removeUserFromComision,
  addUserToComision,
} = require("../controllers/comisionController");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

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
 *             $ref: '#/components/schemas/Comisiones'
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
router.post("/comisiones/grupo", authMiddleware, admin, createGroupComision);

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
router.delete("/comisiones/:group_id/usuario/:user_id", authMiddleware, admin, removeUserFromComision);

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
 *             $ref: '#/components/schemas/Comisiones'
 *     responses:
 *       201:
 *         description: Usuario agregado exitosamente a la comisión
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comisiones'
 *       404:
 *         description: Grupo de comisión no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.post("/comisiones/:group_id/usuario", authMiddleware, admin, addUserToComision);

module.exports = router;
