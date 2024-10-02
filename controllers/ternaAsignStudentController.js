const  TernaAsignStudent  = require("../models/ternaAsignStudent");
const  User  = require("../models/user");
const  groupTerna  = require("../models/groupTerna");
const { logActivity } = require("../sql/appLog");

const createTernaAsignStudent = async (req, res) => {
  const { groupTerna_id, student_id } = req.body;
  try {
    // Verificar si el grupo terna existe
    const groupTernaExists = await groupTerna.findByPk(groupTerna_id);
    if (!groupTernaExists) {
      return res.status(404).json({ error: "Grupo terna no existe" });
    }

    // Verificar si el estudiante existe
    const studentExists = await User.findByPk(student_id);
    if (!studentExists) {
      return res.status(404).json({ error: "Estudiante no existe" });
    }

    // Verificar si ya existe una asignación para ese estudiante en el grupo terna
    const existingAssignment = await TernaAsignStudent.findOne({
      where: { groupTerna_id, student_id },
    });
    if (existingAssignment) {
      return res.status(400).json({ error: "El estudiante ya está asignado a este grupo terna" });
    }


    await logActivity(
      student_id,
      studentExists.sede_id,
      studentExists.name,
      `Se asignó al estudiante: ${studentExists.name} a un grupo terna`,
      "Asignación de estudiante a grupo terna"
    );

    // Crear la asignación
    const ternaAsignStudent = await TernaAsignStudent.create({
      groupTerna_id,
      student_id,
    });
    res.status(201).json(ternaAsignStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listStudentsByGroupTerna = async (req, res) => {
    const { groupTerna_id } = req.params;
    try {
      // Verificar si el grupo terna existe
      const groupTernaExists = await groupTerna.findByPk(groupTerna_id);
      if (!groupTernaExists) {
        return res.status(404).json({ error: "Grupo terna no existe" });
      }
  
      // Obtener los estudiantes asignados al grupo terna sin paginación
      const students = await TernaAsignStudent.findAll({
        where: { groupTerna_id },
        include: {
          model: User,
          attributes: ["user_id", "name", "email"],
        },
      });
  
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = {
  createTernaAsignStudent,
  listStudentsByGroupTerna,
};
