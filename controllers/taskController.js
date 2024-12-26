const Task = require("../models/task");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/course");
const Year = require("../models/year");
const { sendEmailTask } = require("./emailController");
const { addTimeline } = require("../sql/timeline");
const Sede = require("../models/sede");
const TypeTask = require("../models/typeTask");
const TaskSubmissions = require("../models/taskSubmissions");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

const createTask = async (req, res) => {
  const {
    course_id,
    sede_id,
    typeTask_id,
    title,
    description,
    taskStart,
    endTask,
    startTime,
    endTime,
  } = req.body;
  const user_id = req.user_id;
  const { sede_id: tokenSedeId } = req;

  try {
    // Paso 1: Validar que la fecha de inicio no sea mayor a la fecha final
    if (new Date(taskStart) > new Date(endTask)) {
      return res.status(400).json({
        message:
          "La fecha de inicio de la tarea no puede ser posterior a la fecha de finalización.",
      });
    }

    // Paso 2: Validar que el sede_id en la solicitud coincida con el sede_id del token
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({
        message: "No tienes permiso para acceder a esta sede.",
      });
    }

    // Paso 3: Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Paso 4: Buscar o crear el año actual en la tabla Year
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    const year_id = yearRecord.year_id;

    // Paso 5: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso, sede y año.",
      });
    }

    // Paso 6: Validar si el curso está activo
    if (!courseSedeAssignment.courseActive) {
      return res.status(400).json({
        message: "El curso no está activo.",
      });
    }

    const assignedCourseId = courseSedeAssignment.course_id;

    // Paso 7: Validar si el tipo de tarea es "Propuesta de tesis" y el curso no permite este tipo de tarea
    if (typeTask_id === 1 && assignedCourseId === 2) {
      return res.status(404).json({
        message:
          "No se puede crear una tarea de propuesta de tesis en este curso.",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Paso 8: Validar si ya existe una tarea de tipo "Propuesta de tesis"
    if (typeTask_id === 1) {
      const tareaExistente = await Task.findOne({
        where: { asigCourse_id, typeTask_id: 1, year_id },
      });

      if (tareaExistente) {
        return res.status(400).json({
          message:
            "Ya existe una tarea de propuesta de tesis para este curso y año.",
        });
      }
    }

    // Paso 9: Crear la nueva tarea
    const newTask = await Task.create({
      asigCourse_id,
      typeTask_id,
      title,
      description,
      taskStart,
      endTask,
      startTime,
      endTime,
      year_id,
    });

    // Paso 10: Registrar actividad del usuario
    /*     const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Nueva tarea con título: ${title}`,
      "Creación de tarea"
    ); */

    // Paso 11: Obtener la tarea anterior
    const newTaskId = newTask.task_id;

    if (newTaskId) {
      // Paso 12 y 14: Obtener todos los estudiantes asignados al curso y enviar notificaciones
      const studentsAndEmails = await User.findAll({
        where: { rol_id: 1, sede_id, year_id },
        include: [
          {
            model: CourseAssignment,
            where: { asigCourse_id },
          },
        ],
        attributes: ["user_id", "name", "email"],
      });
      
      // Validar si la tarea es "Propuesta de tesis", no crear los registros de TaskSubmissions
      if (typeTask_id !== 1) {
        // Paso 13: Asignar la nueva tarea a todos los estudiantes
        for (const student of studentsAndEmails) {
          await TaskSubmissions.create({
            user_id: student.user_id,
            task_id: newTaskId,
            submission_complete: false,
          });
        }
      }

      for (const userEmail of studentsAndEmails) {
        /*       const templateVariables = {
          nombre: userEmail.name,
          titulo: title,
          descripcion: description,
          fecha: new Date(endTask).toLocaleDateString(),
          autor: user.name,
        };

        await sendEmailTask(
          "Nueva tarea creada: " + title,
          `Se ha creado una nueva tarea en la plataforma TesM con el título: ${title}`,
          userEmail.email,
          templateVariables
        ); */

        const course = await Course.findByPk(courseSedeAssignment.course_id);

        await addTimeline(
          userEmail.user_id,
          "Tarea creada",
          `Se ha creado una nueva tarea en el curso: ${course.courseName} con el título: ${title}`,
          newTask.task_id
        );
      }
    }

    // Paso 15: Enviar respuesta de éxito
    res.status(201).json({
      message: "La tarea ha sido creada exitosamente.",
    });
  } catch (error) {
    // Paso 16: Manejar errores y enviar respuesta de error
    res.status(500).json({
      message: "Error al crear la tarea",
      error: error.message || error,
    });
  }
};

const listTasks = async (req, res) => {
  const { sede_id, year } = req.params;
  const user_id = req.user_id;

  try {
    // Buscar el año en la tabla Year
    const yearRecord = await Year.findOne({ where: { year } });

    // Verificar si se encontró el año
    if (!yearRecord) {
      return res
        .status(404)
        .json({ message: `No se encontró un registro para el año ${year}.` });
    }

    const year_id = yearRecord.year_id;

    // Buscar las asignaciones de curso para la sede y el año
    const courseSedeAssignments = await CourseSedeAssignment.findAll({
      where: { sede_id, year_id, courseActive: true },
      attributes: ["asigCourse_id"],
    });

    // Verificar si existen asignaciones
    if (!courseSedeAssignments || courseSedeAssignments.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron asignaciones de cursos para la sede y año especificados.",
      });
    }

    const asigCourseIds = courseSedeAssignments.map(
      (assignment) => assignment.asigCourse_id
    );

    // Buscar las tareas asociadas a la sede y al año
    const tasks = await Task.findAll({
      where: { asigCourse_id: asigCourseIds, year_id },
    });

    // Verificar si se encontraron tareas
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        message: "No se encontraron tareas para la sede y año especificados.",
      });
    }

    // Obtener información del usuario solicitante
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Registrar actividad en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Obtener todas las tareas",
      `Listó todas las tareas para la sede ${sede_id} y el año ${year}.`
    );

    // Devolver las tareas
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error); // Registrar el error completo
    res.status(500).json({
      message: "Error al obtener las tareas",
      error: error.message || "Error desconocido", // Captura el mensaje de error
    });
  }
};

const listTask = async (req, res) => {
  const { task_id } = req.params;
  const { sede_id: tokenSedeId } = req;

  try {
    // Buscar la tarea incluyendo la información de CourseSedeAssignment
    const task = await Task.findByPk(task_id, {
      include: [
        {
          model: CourseSedeAssignment,
          attributes: ["sede_id"], // Solo traer la información necesaria
        },
      ],
    });

    // Validar si la tarea existe
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Validar si la sede coincide con la sede del token
    const courseSedeAssignment = task.CourseSedeAssignment; // Sequelize incluye la relación automáticamente
    if (!courseSedeAssignment || courseSedeAssignment.sede_id !== tokenSedeId) {
      return res.status(403).json({ message: "No tienes acceso a esta tarea" });
    }

    res.status(200).json({
      message: "Tarea encontrada exitosamente.",
      data: task,
    });
  } catch (error) {
    console.error("Error al obtener la tarea:", error);
    res.status(500).json({
      message: "Error al obtener la tarea.",
      error: error.message || error,
    });
  }
};

const listTasksByCourse = async (req, res) => {
  const { sede_id, course_id, year } = req.params;
  const user_id = req.user_id;

  try {
    // Validar el año en la tabla Year
    const yearRecord = await Year.findOne({ where: { year } });
    if (!yearRecord) {
      return res
        .status(404)
        .json({ message: `No se encontró un registro para el año ${year}.` });
    }

    const year_id = yearRecord.year_id;

    // Validar que el curso exista
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res
        .status(404)
        .json({ message: `No se encontró el curso con ID ${course_id}.` });
    }

    // Validar que la sede exista
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res
        .status(404)
        .json({ message: `No se encontró la sede con ID ${sede_id}.` });
    }

    // Buscar la asignación de curso y sede para el año especificado
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso, sede y año.",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Buscar todas las tareas asociadas a la asignación de curso, sede y año
    const tasks = await Task.findAll({
      where: { asigCourse_id, year_id },
    });

    // Verificar si se encontraron tareas
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron tareas para el curso, sede y año especificados.",
      });
    }

    // Obtener información del usuario solicitante
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Registrar actividad en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Obtener todas las tareas",
      `Listó todas las tareas del curso con ID ${course_id} para la sede ${sede_id} en el año ${year}`
    );

    // Responder con las tareas encontradas
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    res.status(500).json({
      message: "Error al obtener las tareas",
      error: error.message || "Error desconocido",
    });
  }
};

const updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { title, description, taskStart, endTask, startTime, endTime } =
    req.body;
  const user_id = req.user_id;
  const { sede_id: tokenSedeId } = req; // Extraer sede_id del token
  try {
    // Validar que la tarea exista
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    // Validar la asignación de curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id: task.asigCourse_id },
    });

    // Validar que el sede_id de la tarea coincida con el del token
    if (
      parseInt(courseSedeAssignment.sede_id, 10) !== parseInt(tokenSedeId, 10)
    ) {
      return res.status(403).json({ message: "No tienes acceso a esta tarea" });
    }
    // Validar si el curso está inactivo
    if (!courseSedeAssignment.courseActive) {
      return res.status(400).json({
        message:
          "No se puede actualizar la tarea ya que el curso está inactivo.",
      });
    }

    // Actualizar la tarea con los nuevos campos
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.taskStart = taskStart ?? task.taskStart;
    task.endTask = endTask ?? task.endTask;
    task.startTime = startTime ?? task.startTime;
    task.endTime = endTime ?? task.endTime;

    // Registrar la actividad del usuario
    const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Actualizó tarea con id: ${task_id}`,
      "Se actualizó tarea"
    );

    await task.save();

    res.status(200).json({ message: "Tarea actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({
      message: "Error al actualizar la tarea",
      error: error.message || "Error desconocido",
    });
  }
};

module.exports = {
  createTask,
  listTasks,
  listTask,
  updateTask,
  listTasksByCourse,
};
