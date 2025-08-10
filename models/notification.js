const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Task = require("./task");
const Sede = require("./sede");

/**
 * Notification Model
 *
 * This model represents a notification in the system. It includes various fields
 * such as notification text, the associated `sede`, student, and task, as well as
 * the type of notification (either "student" or "general").
 *
 * @module notification
 * @typedef {Object} Notification
 *
 * @property {number} notification_id - The unique identifier for each notification (primary key).
 * @property {string} notification_text - The text content of the notification.
 * @property {number} sede_id - The ID of the `sede` where the notification is associated.
 * @property {number} student_id - The ID of the student receiving the notification.
 * @property {number} task_id - The ID of the task associated with the notification.
 * @property {Date} notification_date - The date and time when the notification was created.
 * @property {string} type_notification - The type of notification, either "student" or "general".
 *
 * @see {@link ./user} for the User model.
 * @see {@link ./task} for the Task model.
 * @see {@link ./sede} for the Sede model.
 */
const notification = sequelize.define(
  "notification",
  {
    notification_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    notification_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "task_id",
      },
    },
    notification_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    type_notification: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "general"]],
          msg: "El tipo de notificación debe ser 'student' o 'general'.",
        },
      },
    },
  },
  {
    tableName: "notification",
    timestamps: true,
  }
);

module.exports = notification;
