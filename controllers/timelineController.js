const Task = require("../models/task");
const TimelineEventos = require("../models/timelineEventos");
const User = require("../models/user");
const { sendCommentEmail } = require("./emailController");

const getTimelineByUserId = async (req, res) => {
  const { user_id } = req.params; // Obtener el user_id desde los parámetros de la URL

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" }); // Retorna aquí si el usuario no se encuentra
    }
    
    // Buscar los eventos del usuario específico
    const eventos = await TimelineEventos.findAll({
      where: { user_id },
    });

    // Verificar si hay eventos
    if (eventos.length === 0) {
      return res.status(404).json({ message: "No se encontraron eventos para este usuario" });
    }

    // Responder con los eventos encontrados
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al obtener los eventos del usuario",
      error: error.message,
    });
  }
};

const getTimelineByUserAndTask = async (req, res) => {
  const { user_id, task_id } = req.params;

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Buscar los eventos del usuario en una tarea específica
    const eventos = await TimelineEventos.findAll({
      where: { user_id, task_id },
    });

    // Verificar si hay eventos
    if (eventos.length === 0) {
      return res.status(404).json({ message: "No se encontraron eventos para esta tarea y usuario" });
    }

    // Responder con los eventos encontrados
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al obtener los eventos de la tarea y usuario",
      error: error.message,
    });
  }
};

// Exportar las funciones
module.exports = { getTimelineByUserId, getTimelineByUserAndTask };
