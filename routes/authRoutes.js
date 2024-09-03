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
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - carnet
 *         - sede_id
 *         - rol_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: Auto-generated ID of the user
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *         name:
 *           type: string
 *           description: User's name
 *         carnet:
 *           type: string
 *           description: User's ID card number
 *         sede_id:
 *           type: integer
 *           description: ID of the user's location
 *         rol_id:
 *           type: integer
 *           description: ID of the user's role
 *         registrationYear:
 *           type: integer
 *           description: Year of user's registration
 *         profilePhoto:
 *           type: string
 *           description: User's profile photo
 *         activoTerna:
 *           type: boolean
 *           description: Active status in the terna
 *       example:
 *         email: example@gmail.com
 *         password: example123
 *         name: Juan Pérez
 *         carnet: 123456789
 *         sede_id: 1
 *         rol_id: 1
 *         registrationYear: 2021
 *
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
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
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Error in user creation
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

module.exports = router;
