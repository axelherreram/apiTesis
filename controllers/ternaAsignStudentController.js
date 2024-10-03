const  TernaAsignStudent  = require("../models/ternaAsignStudent");
const  User  = require("../models/user");
const  groupTerna  = require("../models/groupTerna");
const { logActivity } = require("../sql/appLog");

const createTernaAsignStudent = async (req, res) => {
  const assignments = req.body; // array de asignaciones [{groupTerna_id, student_id}
  
  try {
    for (const { groupTerna_id, student_id } of assignments) {
      // Verificar si el grupo terna existe
      const groupTernaExists = await groupTerna.findByPk(groupTerna_id);
      if (!groupTernaExists) {
        return res.status(404).json({ error: `Grupo terna con id ${groupTerna_id} no existe` });
      }

      // Verificar si el estudiante existe
      const studentExists = await User.findByPk(student_id);
      if (!studentExists) {
        return res.status(404).json({ error: `Estudiante con id ${student_id} no existe` });
      }

      // Verificar si ya existe una asignación para ese estudiante en el grupo terna
      const existingAssignment = await TernaAsignStudent.findOne({
        where: { groupTerna_id, student_id },
      });
      if (existingAssignment) {
        return res.status(400).json({ error: `El estudiante: ${studentExists.name} ya está asignado otro grupo` });
      }

      // Registrar actividad
      await logActivity(
        student_id,
        studentExists.sede_id,
        studentExists.name,
        `Se asignó al estudiante: ${studentExists.name} al grupo terna con id ${groupTerna_id}`,
        "Asignación de estudiante a grupo terna"
      );

      // Crear la asignación
      await TernaAsignStudent.create({
        groupTerna_id,
        student_id,
      });
    }

    res.status(201).json({ message: "Asignaciones creadas exitosamente" });
  } catch (error) {
    console.error("Error al crear las asignaciones de terna:", error);
    res.status(500).json({ error: "Error al crear las asignaciones de terna", details: error.message });
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
