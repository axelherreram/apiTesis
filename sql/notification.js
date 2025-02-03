const Notification = require("../models/notification");

/**
 * Creates a new notification entry in the database.
 *
 * This function registers a notification associated with a teacher, optionally linked to a student and a task.
 *
 * @param {string} notification_text - The content of the notification.
 * @param {number} sede_id - The ID of the location where the notification is sent.
 * @param {number} [student_id] - The ID of the student receiving the notification.
 * @param {number} [task_id] - The ID of the related task.
 * @param {string} type_notification - The type of notification, either "student" or "general".
 *
 * @throws {Error} - If required parameters are missing or if there is an issue creating the notification.
 *
 * @example
 * // Example usage of the createNotification function:
 * createNotification("New task assigned", 1, 2, 5, "teacher");
 *
 * This will create a new notification entry in the database with the provided details.
 */
async function createNotification(
  notification_text,
  sede_id,
  student_id,
  task_id,
  type_notification
) {
  try {
    if (!notification_text || !sede_id || !type_notification) {
      console.error("Required parameters are missing:", {
        notification_text,
        sede_id,
        type_notification,
      });
      return;
    }

    await Notification.create({
      notification_text,
      sede_id,
      student_id,
      task_id,
      type_notification,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

module.exports = { createNotification };
