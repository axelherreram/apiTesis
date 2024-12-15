const TaskSubmission = require("../models/taskSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const TaskSubmissions = require("../models/taskSubmissions");
const CourseAssignment = require("../models/courseAssignment");

const createTaskSubmission = async (req, res) => {
  const { user_id, task_id } = req.body;

  try {
    // Paso 1: Verificar si el usuario existe
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    // Paso 2: Verificar si la tarea existe y está dentro del rango de fechas y horas
    const taskExist = await Task.findByPk(task_id);
    if (!taskExist) {
      return res.status(404).json({ message: "La tarea no existe" });
    }

    const currentDate = new Date();
    const currentTime = currentDate.toTimeString().split(' ')[0];

    if (
      currentDate < new Date(taskExist.taskStart) ||
      currentDate > new Date(taskExist.endTask) ||
      currentTime < taskExist.startTime ||
      currentTime > taskExist.endTime
    ) {
      return res.status(400).json({
        message: "La tarea no está dentro del rango de fechas y horas permitido para la entrega",
      });
    }

    // Paso 3: Verificar si ya existe una tarea de envío para este usuario y tarea
    const taskSubmissionExist = await TaskSubmission.findOne({
      where: { user_id, task_id },
    });
    if (taskSubmissionExist) {
      return res.status(400).json({
        message: "La tarea de envío ya existe para este usuario y tarea",
      });
    }

    // Paso 4: Crear un nuevo registro de tarea de envío con submission_complete a true
    await TaskSubmission.create({
      user_id,
      task_id,
      submission_complete: true,
    });

    // Paso 5: Enviar respuesta exitosa
    res.status(201).json({
      message: "Tarea de envío creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear la tarea de envío:", error);

    // Paso 6: Manejo de errores del servidor
    res.status(500).json({
      message: "Error en el servidor al crear la tarea de envío",
      error: error.message,
    });
  }
};

const getCourseDetails = async (req, res) => {
  const { course_id, sede_id } = req.params;

  try {
    // Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id: sede_id},
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Obtener todos los estudiantes asignados al curso
    const students = await User.findAll({
      where: { rol_id: 1, sede_id },
      include: [
        {
          model: CourseAssignment,
          where: { asigCourse_id },
        },
      ],
      attributes: ["user_id", "name", "email"],
    });

    // Obtener todas las tareas del curso
    const tasks = await Task.findAll({
      where: { asigCourse_id },
      attributes: ["task_id", "title", "description", "taskStart", "endTask"],
    });

    // Obtener las entregas de tareas de los estudiantes
    const studentTasks = await Promise.all(
      students.map(async (student) => {
        const submissions = await TaskSubmissions.findAll({
          where: { user_id: student.user_id },
          attributes: ["task_id", "submission_complete", "date"],
        });

        return {
          student,
          submissions,
        };
      })
    );

    res.status(200).json({
      course: courseSedeAssignment,
      students: studentTasks,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la información del curso",
      error: error.message || error,
    });
  }
};


module.exports = {
  getCourseDetails,
  createTaskSubmission,
};
