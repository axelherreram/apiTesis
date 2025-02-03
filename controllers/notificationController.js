const Notification = require("../models/notification");

// Obtener notificaciones por sede_id (para administrador)
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

// Obtener notificaciones por user_id (para estudiante)
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
