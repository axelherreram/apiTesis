const CourseAssignment = require("../models/courseAssignment");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const { Op } = require("sequelize");

const updateNote = async (req, res) => {
  try {
    const { student_id, course_id, note } = req.body;

    if (!student_id || !course_id || note === undefined) {
      return res.status(400).json({ message: "Faltan parámetros requeridos." });
    }

    // Buscar todas las asignaciones de ese curso
    const courseAssignments = await CourseSedeAssignment.findAll({
      where: { course_id },
    });

    if (!courseAssignments || courseAssignments.length === 0) {
      return res.status(404).json({ message: "No se encontró una asignación del curso." });
    }

    // Buscar si el estudiante está asignado a alguna de esas asignaciones
    const courseAssignment = await CourseAssignment.findOne({
      where: {
        student_id,
        asigCourse_id: {
          [Op.in]: courseAssignments.map(ca => ca.asigCourse_id),
        },
      },
    });

    if (!courseAssignment) {
      return res.status(404).json({ message: "El estudiante no está asignado a ese curso." });
    }

    // Actualizar la nota
    courseAssignment.note = note;
    await courseAssignment.save();

    return res.status(200).json({
      message: "Nota actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error al actualizar la nota:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Lists the note for a specific student and course assignment.
 * @param req - The request object containing user_id and course_id in params.
 * @param res - The response object.
 * @returns A JSON response with the note or an error message.
 */
const listNotes = async (req, res) => {
  try {
    const { user_id, course_id } = req.params; // Assuming user_id and course_id are in URL params

    if (!user_id || !course_id) {
      return res.status(400).json({ message: "Faltan parámetros requeridos (user_id, course_id)." });
    }

    // Find all assignments for that course
    const courseAssignmentsSede = await CourseSedeAssignment.findAll({
      where: { course_id },
    });

    if (!courseAssignmentsSede || courseAssignmentsSede.length === 0) {
      return res.status(404).json({ message: "No se encontró una asignación del curso para ninguna sede." });
    }

    // Find if the student is assigned to any of those assignments
    const courseAssignment = await CourseAssignment.findOne({
      where: {
        student_id: user_id,
        asigCourse_id: {
          [Op.in]: courseAssignmentsSede.map(ca => ca.asigCourse_id),
        },
      },
      attributes: ['note'], // Select only the note field
    });

    if (!courseAssignment) {
      return res.status(404).json({ message: "El estudiante no está asignado a ese curso o no tiene nota registrada." });
    }

    // Return the note
    return res.status(200).json({ note: courseAssignment.note });

  } catch (error) {
    console.error("Error al listar la nota:", error);
    return res.status(500).json({ message: "Error interno del servidor al listar la nota." });
  }
};

module.exports = { updateNote, listNotes };
