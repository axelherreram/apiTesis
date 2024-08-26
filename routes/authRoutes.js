const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const { upload, handleMulterErrors } = require("../middlewares/uploadMiddleware");
/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Operaciones de autenticación
 *
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - nombre
 *         - carnet
 *         - sede_id
 *         - rol_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID autogenerado del usuario
 *         email:
 *           type: string
 *           description: Email del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         carnet:
 *           type: string
 *           description: Carnet del usuario
 *         sede_id:
 *           type: integer
 *           description: ID de la sede del usuario
 *         rol_id:
 *           type: integer
 *           description: ID del rol del usuario
 *         anioRegistro:
 *           type: integer
 *           description: Año de registro del usuario
 *         fotoPerfil:
 *           type: string
 *           description: Foto de perfil del usuario
 *         activoTerna:
 *           type: boolean
 *           description: Activo o inactivo en la terna
 *       example:
 *         email: example@gmail.com
 *         password: example123
 *         nombre: Juan Pérez
 *         carnet: 123456789
 *         sede_id: 1
 *         anioRegistro: 2021
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en la creación del usuario
 */
router.post("/register", authController.registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión con un usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *             example:
 *               email: example@gmail.com
 *               password: example123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Credenciales inválidas
 */
router.post("/login", authController.loginUser);

/**
 * @swagger
 * /auth/updatePassword:
 *   put:
 *     summary: Actualiza la contraseña del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña del usuario
 *             example:
 *               currentPassword: "newpassword123"
 *               newPassword: "newpassword1232"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Error al actualizar la contraseña
 */
router.put(
  "/updatePassword",
  authMiddleware,
  authController.actualizarPassword
);




/**
 * @swagger
 * /auth/updateFotoPerfil:
 *   put:
 *     summary: Actualiza la foto de perfil del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fotoPerfil:
 *                 type: string
 *                 format: binary
 *                 description: Nueva foto de perfil del usuario
 *     responses:
 *       200:
 *         description: Foto de perfil actualizada exitosamente
 *       400:
 *         description: Error al actualizar la foto de perfil
 */
router.put(
  "/updateFotoPerfil",
  authMiddleware,
  upload.single("fotoPerfil"),
  authController.actualizarFotoPerfil,
  handleMulterErrors
);

module.exports = router;
