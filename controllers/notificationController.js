const Notification = require("../models/notification");

/**
 * Get notifications by `sede_id` (for administrator).
 * This endpoint fetches all the general type notifications for a specific `sede_id`,
 * ordered by notification date in descending order.
 * 
 * @param {Object} req - The request object containing the `sede_id` in the URL params.
 * @param {Object} res - The response object to send the notifications or error message.
 * 
 * @returns {Object} - A JSON object with the list of notifications or an error message.
 * @throws {Error} - If an error occurs while fetching the notifications.
 */
const getNotificationsBySede = async (req, res) => {
  const { sede_id } = req.params; // Accedemos al parámetro de ruta

  if (!sede_id) {
    return res
      .status(400)
      .json({ error: "El parámetro 'sede_id' es obligatorio." });
  }

  try {
    const notifications = await Notification.findAll({
      where: {
        sede_id: sede_id,
        type_notification: "general",
      },
      attributes: ["notification_text", "notification_date", "task_id", "student_id"],
      order: [["notification_date", "DESC"]], // Ordenar de forma descendente
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Hubo un error al obtener las notificaciones." });
  }
};

/**
 * Get notifications by `user_id` (for student).
 * This endpoint fetches all the student type notifications for a specific `user_id`,
 * ordered by notification date in descending order.
 * 
 * @param {Object} req - The request object containing the `user_id` in the URL params.
 * @param {Object} res - The response object to send the notifications or error message.
 * 
 * @returns {Object} - A JSON object with the list of notifications or an error message.
 * @throws {Error} - If an error occurs while fetching the notifications.
 */
const getNotificationsByUser = async (req, res) => {
  const { user_id } = req.params; // Accedemos al parámetro de ruta

  if (!user_id) {
    return res
      .status(400)
      .json({ error: "El parámetro 'user_id' es obligatorio." });
  }

  try {
    const notifications = await Notification.findAll({
      where: {
        student_id: user_id,
        type_notification: "student",
      },
      attributes: ["notification_text", "notification_date", "task_id", "sede_id"],
      order: [["notification_date", "DESC"]], // Ordenar de forma descendente
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Hubo un error al obtener las notificaciones." });
  }
};

module.exports = {
  getNotificationsBySede,
  getNotificationsByUser,
};
