const TaskSubmission = require("../models/taskSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const TaskSubmissions = require("../models/taskSubmissions");
const CourseAssignment = require("../models/courseAssignment");
const Year = require("../models/year");

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

    // Obtener la fecha y hora actual en la zona horaria local
    const currentDate = new Date();
    const localDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
    const currentTime = localDate.toTimeString().split(' ')[0];

    // Convertir las horas a formato comparable (segundos desde la medianoche)
    const [currentHour, currentMinute, currentSecond] = currentTime.split(':').map(Number);
    const [startHour, startMinute, startSecond] = taskExist.startTime.split(':').map(Number);
    const [endHour, endMinute, endSecond] = taskExist.endTime.split(':').map(Number);

    const currentTotalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;
    const startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
    const endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

    if (
      localDate < new Date(taskExist.taskStart) ||
      localDate > new Date(taskExist.endTask) ||
      currentTotalSeconds < startTotalSeconds ||
      currentTotalSeconds > endTotalSeconds
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
      // Si ya existe, actualizar el registro con la fecha actual
      await taskSubmissionExist.update({
        submission_complete: true,
        date: localDate,
      });

      return res.status(200).json({
        message: "Tarea de envío actualizada exitosamente",
      });
    }

    // Paso 4: Crear un nuevo registro de tarea de envío con submission_complete a true
    await TaskSubmission.create({
      user_id,
      task_id,
      submission_complete: true,
      date: localDate,
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
  const { course_id, sede_id, year } = req.params;

  try {

    const yearRecord = await Year.findOne({
      where: { year },
    });

    const year_id = yearRecord.year_id;

    // Paso 1: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Paso 2: Obtener todos los estudiantes asignados al curso
    const students = await User.findAll({
      where: { rol_id: 1, sede_id },
      include: [
        {
          model: CourseAssignment,
          where: { asigCourse_id },
        },
      ],
      attributes: ["user_id", "name", "email", "carnet"],
    });

    // Paso 3: Obtener todas las tareas del curso
    const tasks = await Task.findAll({
      where: { asigCourse_id },
      attributes: ["task_id", "title", "description", "taskStart", "endTask"],
    });

    // Paso 4: Obtener las entregas de tareas de los estudiantes
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

    // Paso 5: Enviar la respuesta con los detalles del curso
    res.status(200).json({
      students: studentTasks,
    });
  } catch (error) {
    // Paso 6: Manejo de errores del servidor
    res.status(500).json({
      message: "Error al obtener la información del curso",
      error: error.message || error,
    });
  }
};

const getStudentCourseDetails = async (req, res) => {
  const { user_id, course_id, sede_id, year } = req.params;

  try {
    // Paso 1: Verificar si el estudiante existe
    const student = await User.findByPk(user_id);
    if (!student) {
      return res.status(404).json({ message: "El estudiante no existe" });
    }

    // Paso 2: Verificar si el año existe
    const yearRecord = await Year.findOne({
      where: { year },
    });
    if (!yearRecord) {
      return res.status(404).json({ message: "El año no existe" });
    }
    const year_id = yearRecord.year_id;

    // Paso 3: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });
    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }
    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Paso 4: Verificar si el estudiante está asignado al curso
    const courseAssignment = await CourseAssignment.findOne({
      where: { student_id: user_id, asigCourse_id },
    });
    if (!courseAssignment) {
      return res.status(404).json({
        message: "El estudiante no está asignado a este curso",
      });
    }

    // Paso 5: Obtener todas las tareas del curso
    const tasks = await Task.findAll({
      where: { asigCourse_id },
      attributes: ["task_id"],
    });

    // Paso 6: Obtener las entregas de tareas del estudiante filtradas por curso
    const submissions = await TaskSubmissions.findAll({
      where: {
        user_id,
        task_id: tasks.map(task => task.task_id), // Filtrar por las tareas del curso
      },
      attributes: ["task_id", "submission_complete", "date"],
    });

    // Paso 7: Enviar la respuesta con los detalles del curso y las entregas del estudiante
    res.status(200).json({
      student: {
        user_id: student.user_id,
        name: student.name,
        email: student.email,
        carnet: student.carnet,
      },
      course: {
        course_id: courseSedeAssignment.course_id,
        sede_id: courseSedeAssignment.sede_id,
        year_id: courseSedeAssignment.year_id,
        courseActive: courseSedeAssignment.courseActive,
      },
      submissions,
    });
  } catch (error) {
    // Paso 8: Manejo de errores del servidor
    res.status(500).json({
      message: "Error al obtener la información del curso del estudiante",
      error: error.message || error,
    });
  }
};

module.exports = {
  getCourseDetails,
  createTaskSubmission,
  getStudentCourseDetails
};
