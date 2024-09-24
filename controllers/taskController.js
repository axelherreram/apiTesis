const Task = require("../models/task");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/course");

const { sendEmailTask } = require("./emailController");
const { addTimeline } = require("../sql/timeline");

const createTask = async (req, res) => {
  const {
    course_id,
    sede_id,
    typeTask_id,
    title,
    description,
    taskStart,
    endTask,
  } = req.body;
  const user_id = req.user_id; // Extraer el user_id del request (asumiendo que está adjunto en el middleware de autenticación)

  try {
    // Buscar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, courseActive: true }, // courseActive: true para asegurar que el curso esté activo
    });

    // Verificar si se encontró la asignación entre el curso y la sede
    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede.",
      });
    }

    // Buscar el curso usando su ID
    const course = await Course.findByPk(course_id); // Usamos findByPk para encontrar el curso
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" }); // Validación en caso de que el curso no exista
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id; // Obtener el ID de la asignación del curso y sede

    // Validar si el tipo de tarea es "Propuesta de tesis" (typeTask_id = 1)
    if (typeTask_id === 1) {
      // Verificar si ya existe una tarea de tipo "Propuesta de tesis" en la misma asignación de curso y sede
      const tareaExistente = await Task.findOne({
        where: { course_id: asigCourse_id, sede_id, typeTask_id: 1 }, // 1 es el ID de "Propuesta de tesis"
      });

      // Si la tarea ya existe, devolver un error
      if (tareaExistente) {
        return res.status(400).json({
          message: "¡La tarea de propuesta de tesis ya existe!",
        });
      }
    }

    // Crear la nueva tarea en la base de datos
    const newTask = await Task.create({
      course_id: asigCourse_id, // Usar asigCourse_id en lugar de course_id
      sede_id,
      typeTask_id,
      title,
      description,
      taskStart,
      endTask,
    });

    // Registrar la actividad en la bitácora (log de actividades)
    const user = await User.findByPk(user_id); // Buscar el usuario que está creando la tarea
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `El usuario creó una nueva tarea con título: ${title}`, // Descripción del evento
      "Creación de tarea" // Tipo de evento
    );

    // Buscar los correos electrónicos de los estudiantes asignados al curso y la sede
    const userEmails = await User.findAll({
      where: { rol_id: 1, sede_id }, // Filtrar por rol de estudiante y sede
      include: [
        {
          model: CourseAssignment,
          where: { course_id }, // Filtrar por las asignaciones del curso
        },
      ],
      attributes: ["user_id", "name", "email"],
    });

    // Añadir la tarea a la línea de tiempo y enviar notificaciones a los estudiantes
    for (const userEmail of userEmails) {
      /*   const templateVariables = {
          nombre: userEmail.name,
          titulo: title,
          descripcion: description,
          fecha: new Date(endTask).toLocaleDateString(),
          autor: user.name,
        }; */
        await addTimeline(
          userEmail.user_id,
          "Tarea creada",
          `Se ha creado una nueva tarea en el curso ${course.courseName} con el título: ${title}`,
          courseSedeAssignment.course_id,
          newTask.task_id
        );
        // await sendEmailTask(
        //   "Nueva tarea creada: " + title,
        //   `Se ha creado una nueva tarea en la plataforma TesM con el título: ${title}`,
        //   userEmail.email,
        //   templateVariables
        // );
      }

      res.status(201).json({
      message: "Tarea creada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la tarea",
      error: error.message || error,
    });
  }
};

const listTasks = async (req, res) => {
  const { sede_id } = req.params;
  const user_id = req.user_id;

  try {
    const tasks = await Task.findAll({ where: { sede_id } });

    const user = await User.findByPk(user_id);

    // Script para registrar en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Obtener todas las tareas",
      `Listó todas las tareas`
    );

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las tareas", error });
  }
};

const listTasksByCourse = async (req, res) => {
  const { sede_id, course_id } = req.params;
  const user_id = req.user_id;

  try {
    const tasks = await Task.findAll({ where: { course_id, sede_id } });

    const user = await User.findByPk(user_id);

    // Script para registrar en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Obtener todas las tareas",
      `Listó todas las tareas por curso`
    );

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las tareas", error });
  }
};

const updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { title, description, taskStart, endTask } = req.body;
  const user_id = req.user_id;

  try {
    // Obtener la tarea
    const task = await Task.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Buscar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id: task.course_id, sede_id: task.sede_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede.",
      });
    }

    // Verificar si el curso está inactivo
    if (!courseSedeAssignment.courseActive) {
      return res.status(400).json({
        message:
          "No se puede actualizar la tarea ya que el curso está inactivo.",
      });
    }

    // Actualizar la tarea
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.taskStart = taskStart ?? task.taskStart;
    task.endTask = endTask ?? task.endTask;

    const user = await User.findByPk(user_id);

    // Script para registrar en la bitácora
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
    res.status(500).json({ message: "Error al actualizar la tarea", error });
  }
};
module.exports = {
  createTask,
  listTasks,
  updateTask,
  listTasksByCourse,
};
