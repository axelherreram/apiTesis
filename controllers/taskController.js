const Task = require("../models/task");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const { where } = require("sequelize");

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
    const task = await Task.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

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
  listTasks,
  updateTask,
  listTasksByCourse,
};
