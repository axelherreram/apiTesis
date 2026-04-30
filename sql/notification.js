const Notification = require("../models/notification");

/**
 * Creates a new notification entry in the database.
 *
 * @param {string} notification_text  - Content of the notification.
 * @param {number} student_id         - ID of the student receiving the notification.
 * @param {number} task_id            - ID of the related task.
 * @param {string} type_notification  - Type: ENUM('student', 'general').
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `sede_id` (transitivo via student_id -> user.sede_id).
 *   La sede se obtiene haciendo JOIN a la tabla `user` cuando se requiera filtrar por sede.
 *
 * @example
 * createNotification("Nueva tarea asignada", 2, 5, "student");
 */
async function createNotification(notification_text, student_id, task_id, type_notification) {
  try {
    if (!notification_text || !student_id || !task_id || !type_notification) {
      console.error("Parámetros requeridos faltantes:", {
        notification_text,
        student_id,
        task_id,
        type_notification,
      });
      return;
    }

    await Notification.create({
      notification_text,
      student_id,
      task_id,
      type_notification,
    });
  } catch (err) {
    console.error("Error al crear notificación:", err);
  }
}

module.exports = { createNotification };
