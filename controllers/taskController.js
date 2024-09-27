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
    note,
  } = req.body;
  const user_id = req.user_id;

  try {
    // Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, courseActive: true },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede.",
      });
    }

    // Validar que el curso exista
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Validar si ya existe una tarea de tipo "Propuesta de tesis"
    if (typeTask_id === 1) {
      const tareaExistente = await Task.findOne({
        where: { course_id: asigCourse_id, sede_id, typeTask_id: 1 },
      });

      if (tareaExistente) {
        return res.status(400).json({
          message: "¡La tarea de propuesta de tesis ya existe!",
        });
      }
    }

    // Crear la nueva tarea
    const newTask = await Task.create({
      course_id: asigCourse_id,
      sede_id,
      typeTask_id,
      title,
      description,
      taskStart,
      endTask,
      note,
    });

    const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `El usuario creó una nueva tarea con título: ${title}`,
      "Creación de tarea"
    );

    const userEmails = await User.findAll({
      where: { rol_id: 1, sede_id },
      include: [
        {
          model: CourseAssignment,
          where: { course_id },
        },
      ],
      attributes: ["user_id", "name", "email"],
    });

    for (const userEmail of userEmails) {
      /*const templateVariables = {
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
/*          await sendEmailTask(
           "Nueva tarea creada: " + title,
           `Se ha creado una nueva tarea en la plataforma TesM con el título: ${title}`,
           userEmail.email,
           templateVariables
         ); */
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
    // Validar que la tarea exista
    const task = await Task.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Validar la asignación de curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id: task.course_id, sede_id: task.sede_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede.",
      });
    }

    // Validar si el curso está inactivo
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
