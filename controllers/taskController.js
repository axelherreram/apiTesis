const Task = require("../models/task");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");

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
  const user_id = req.user_id;

  try {
    // Buscar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, courseActive: true }, // courseActive: true para asegurar que el curso esté activo
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede.",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Verificar si ya existe una tarea de tipo "Propuesta de tesis" en la misma asignación de curso y sede
    const tareaExistente = await Task.findOne({
      where: { course_id: asigCourse_id, sede_id, typeTask_id: 1 }, // 1 es el ID de "Propuesta de tesis"
    });

    if (tareaExistente) {
      return res.status(400).json({
        message: "¡La tarea de propuesta de tesis ya existe!",
      });
    }

    // Crear la nueva tarea
    const newTask = await Task.create({
      course_id: asigCourse_id, // Usar asigCourse_id en lugar de course_id
      sede_id,
      typeTask_id,
      title,
      description,
      taskStart,
      endTask,
    });

    // Registrar la actividad en la bitácora
    const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `El usuario creó una nueva tarea con título: ${title}`,
      "Creación de tarea"
    );

    res.status(201).json({
      message: "Tarea creada exitosamente",
      data: newTask,
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
        message: "No se puede actualizar la tarea ya que el curso está inactivo.",
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
