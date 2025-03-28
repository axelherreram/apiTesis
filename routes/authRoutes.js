const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const { upload, handleMulterErrors } = require("../middlewares/uploadMiddleware");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Operaciones de autenticación de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             example-1:
 *               summary: Ejemplo de solicitud para registrar un nuevo usuario
 *               value:
 *                 email: example@gmail.com
 *                 password: example123
 *                 name: "Juan Pérez"
 *                 carnet: "12345678"
 *                 sede_id: 1
 *                 rol_id: 2
 *                 year: 2024
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             examples:
 *               example-1:
 *                 summary: Respuesta exitosa
 *                 value:
 *                   message: "Usuario registrado exitosamente"
 *       400:
 *         description: Error en la creación del usuario, datos inválidos o ya registrado
 *         content:
 *           application/json:
 *             examples:
 *               example-1:
 *                 summary: Respuesta de error por datos inválidos
 *                 value:
 *                   message: "No se puede crear un año mayor al actual (2024)."
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             examples:
 *               example-1:
 *                 summary: Respuesta de error del servidor
 *                 value:
 *                   message: "Error en el servidor"
 */
router.post("/register", authController.registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión en la aplicación
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *             example:
 *               email: example@gmail.com
 *               password: example123
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authController.loginUser);

/**
 * @swagger
 * /auth/updatePassword:
 *   put:
 *     summary: Actualiza la contraseña del usuario
 *     tags: [Authentication]
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
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 description: User's new password
 *             example:
 *               currentPassword: "example123"
 *               newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password successfully updated
 *       400:
 *         description: Error updating the password
 */
router.put(
  "/updatePassword",
  authMiddleware,
  authController.updatePassword
);

/**
 * @swagger
 * /auth/updateProfilePhoto:
 *   put:
 *     summary: Actualiza la foto de perfil del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: New profile photo for the user
 *     responses:
 *       200:
 *         description: Profile photo successfully updated
 *       400:
 *         description: Error updating the profile photo
 */
router.put(
  "/updateProfilePhoto",
  authMiddleware,
  upload.single("profilePhoto"),
  authController.updateProfilePhoto,
  handleMulterErrors
);

/**
 * @swagger
 * /auth/requestPasswordRecovery:
 *   post:
 *     summary: Solicita la recuperación de la contraseña y envía una nueva contraseña aleatoria al correo del usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *             example:
 *               email: example@gmail.com
 *     responses:
 *       200:
 *         description: Nueva contraseña enviada al correo electrónico
 *       400:
 *         description: Correo electrónico no proporcionado o usuario no encontrado
 *       500:
 *         description: Error en el servidor al recuperar la contraseña
 */
router.post("/requestPasswordRecovery", authController.requestPasswordRecovery);

module.exports = router;
