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

module.exports = { updateNote };
