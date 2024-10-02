const express = require("express");
const { createTernaAsignStudent, listStudentsByGroupTerna } = require("../controllers/ternaAsignStudentController");
const router = express.Router();

/**
 * @swagger
 * /api/terna-asign-student:
 *   post:
 *     summary: Asigna un estudiante a un grupo de terna
 *     tags:
 *       - TernaAsignStudent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupTerna_id:
 *                 type: integer
 *                 description: ID del grupo terna
 *               student_id:
 *                 type: integer
 *                 description: ID del estudiante
 *             example:
 *               groupTerna_id: 1
 *               student_id: 101
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ternaAsignStudent_id:
 *                   type: integer
 *                   description: ID de la asignación de estudiante
 *                 groupTerna_id:
 *                   type: integer
 *                   description: ID del grupo terna
 *                 student_id:
 *                   type: integer
 *                   description: ID del estudiante
 *       400:
 *         description: El estudiante ya está asignado a este grupo terna
 *       404:
 *         description: Grupo terna o estudiante no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.post("/terna-asign-student", createTernaAsignStudent);

/**
 * @swagger
 * /api/terna-asign-student/{groupTerna_id}:
 *   get:
 *     summary: Lista los estudiantes asignados a un grupo de terna
 *     tags:
 *       - TernaAsignStudent
 *     parameters:
 *       - in: path
 *         name: groupTerna_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del grupo terna
 *     responses:
 *       200:
 *         description: Lista de estudiantes asignados al grupo de terna
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     description: ID del estudiante
 *                   name:
 *                     type: string
 *                     description: Nombre del estudiante
 *                   email:
 *                     type: string
 *                     description: Correo electrónico del estudiante
 *       404:
 *         description: Grupo terna no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get("/terna-asign-student/:groupTerna_id", listStudentsByGroupTerna);

module.exports = router;
