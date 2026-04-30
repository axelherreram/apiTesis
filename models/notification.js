const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Task = require("./task");

/**
 * Notification Model
 *
 * Represents a notification sent to a student related to a specific task.
 *
 * Fields:
 * - `notification_id`: Unique identifier (PK, auto-increment).
 * - `notification_text`: Text content of the notification (TEXT, required).
 * - `student_id`: FK to `User`, the student receiving the notification.
 * - `task_id`: FK to `Task`, the task associated with the notification.
 * - `notification_date`: Date/time when the notification was created (default: NOW).
 * - `type_notification`: Type of notification — ENUM('student', 'general').
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `sede_id` (transitivo via student_id -> user.sede_id).
 * - `notification_text` ampliado a TEXT.
 * - `type_notification` convertido a ENUM en lugar de STRING libre.
 *
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` / `updatedAt`.
 * - `tableName: 'notification'`: Database table name.
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
      type: DataTypes.TEXT,
      allowNull: false,
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
      type: DataTypes.ENUM("student", "general"),
      allowNull: false,
    },
  },
  {
    tableName: "notification",
    timestamps: false,
  }
);

module.exports = notification;
