const TaskSubmission = require("../models/taskSubmission");
const Task = require("../models/task");
const User = require("../models/user");

const createTaskSubmission = async (req, res) => {
  const { user_id, task_id } = req.body;

  try {
    // Paso 1: Verificar si el usuario existe
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    // Paso 2: Verificar si la tarea existe
    const taskExist = await Task.findByPk(task_id);
    if (!taskExist) {
      return res.status(404).json({ message: "La tarea no existe" });
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

module.exports = {
  createTaskSubmission,
};
