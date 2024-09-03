const StudentAssignment = require("../models/studentAssignment");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const Sede = require("../models/sede");

const createAssignment = async (req, res) => {
  const user_id = req.user_id;
  try {
    const { instructor_id, student_id } = req.body;

    if (!instructor_id || !student_id) {
      return res
        .status(400)
        .json({ message: "Se requiere instructor_id y student_id" });
    }

    const newAssignment = await StudentAssignment.create({
      instructor_id,
      student_id,
    });

    const user = await User.findByPk(user_id);
    const instructor = await User.findByPk(instructor_id);
    const student = await User.findByPk(student_id);

    await logActivity(
      user_id,
      user.sede_id,
      user.nombre,
      `Creó una asignación para el estudiante: ${student.nombre} con el catedrático: ${instructor.nombre}`,
      'Creación de asignación para estudiante'
    );

    return res.status(201).json({
      message: "Asignación creada exitosamente",
      data: newAssignment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear la asignación", error });
  }
};

const listStudentsByInstructor = async (req, res) => {
  try {
    const { instructor_id } = req.params;

    if (!instructor_id) {
      return res.status(400).json({ message: "Se requiere el instructor_id" });
    }

    const assignments = await StudentAssignment.findAll({
      where: {
        instructor_id,
      },
      attributes: ["instructor_id"],
      include: [
        {
          model: User,
          as: "student",
          attributes: ["user_id", "name", "email", "carnet", "profilePhoto"],
        },
      ],
    });

    if (assignments.length === 0) {
      return res.status(404).json({
        message: `No se encontraron estudiantes asignados para el catedrático con ID ${instructor_id}`,
      });
    }

    const instructor = await User.findByPk(instructor_id, {
      include: [
        {
          model: Sede,
          as: "location",  // Asegúrate de que el alias sea correcto
          attributes: ["nameSede"],
        },
      ],
    });

    const sedeName = instructor?.location?.nameSede || "Sede no asignada";

    await logActivity(
      instructor_id,
      instructor.sede_id,
      instructor.name,
      `Listó los estudiantes asignados a su cuenta con sede: ${sedeName}`,
      "Listar estudiantes"
    );

    return res.status(200).json({
      message: "Estudiantes asignados",
      data: assignments,
    });
  } catch (error) {
    console.error("Error al listar los estudiantes:", error);
    return res.status(500).json({
      message: "Error al listar estudiantes",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  listStudentsByInstructor,
};
