const Task = require("../models/task");
const TimelineEventos = require("../models/timelineEventos");
const User = require("../models/user");
const { sendCommentEmail } = require("../services/emailService"); 

/**
 * The function `getTimelineByUserId` retrieves timeline events for a specific user based on their user
 * ID.
 * @param req - The `req` parameter in the `getTimelineByUserId` function stands for the request
 * object. It contains information about the HTTP request that triggered the function, such as the
 * request parameters, headers, body, and more. In this case, `req.params` is used to extract the `user
 * @param res - The `res` parameter in the `getTimelineByUserId` function represents the response
 * object in Express.js. This object is used to send a response back to the client that made the
 * request. It contains methods like `res.status()` to set the HTTP status code of the response,
 * `res.json
 * @returns If the user is not found, the function returns a 404 status with a JSON response containing
 * the message "Usuario no encontrado" (User not found).
 */
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
      return res
        .status(404)
        .json({ message: "No se encontraron eventos para este usuario" });
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

/**
 * The function `getTimelineByUserAndTask` retrieves timeline events for a specific user and task,
 * handling errors appropriately.
 * @param req - The `req` parameter in the `getTimelineByUserAndTask` function typically represents the
 * HTTP request object, which contains information about the incoming request from the client, such as
 * parameters, headers, body, etc. It is commonly used in Express.js or similar frameworks for handling
 * HTTP requests.
 * @param res - The `res` parameter in the `getTimelineByUserAndTask` function is the response object
 * that will be used to send back the response to the client making the request. It is typically used
 * to set the status code and send data back to the client in the form of JSON or other formats
 * @returns The function `getTimelineByUserAndTask` is returning different responses based on the
 * conditions it encounters:
 */
const getTimelineByUserAndTask = async (req, res) => {
  const { user_id, task_id } = req.params;

  try {
    // Buscar usuario y tarea en una sola operación
    const [user, task] = await Promise.all([
      User.findByPk(user_id),
      Task.findByPk(task_id),
    ]);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Buscar los eventos del usuario en la tarea
    const eventos = await TimelineEventos.findAll({
      where: { user_id, task_id },
      attributes: ["event_id", "event_type", "description", "created_at"], // Especificar los atributos a retornar
    });

    // Verificar si hay eventos
    if (eventos.length === 0) {
      return res.status(404).json({
        message: "No se encontraron eventos para esta tarea y usuario",
      });
    }

    // Responder con los eventos encontrados, formateados si es necesario
    const formattedEventos = eventos.map(event => ({
      eventId: event.event_id,
      eventType: event.event_type,
      description: event.description,
      createdAt: event.created_at,
    }));

    res.status(200).json(formattedEventos);
  } catch (error) {
    console.error("Error al obtener eventos de la tarea y usuario:", error);
    res.status(500).json({
      message: "Error en el servidor al obtener los eventos de la tarea y usuario",
      error: error.message || error,
    });
  }
};

module.exports = { getTimelineByUserId, getTimelineByUserAndTask };
