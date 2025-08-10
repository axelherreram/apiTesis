const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");

/**
 * Model `TaskSubmissions` represents the submissions made by students for specific tasks.
 * 
 * Fields:
 * - `submission_id`: Unique identifier for the submission (Primary Key, auto-increment).
 * - `user_id`: Reference to the student who submitted the task (`User` model).
 * - `task_id`: Reference to the task being submitted (`Task` model).
 * - `submission_complete`: Boolean indicating whether the task was completed (Default: false).
 * - `date`: Date of submission (Default: current timestamp, adjusted for timezone).
 * 
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` or `updatedAt` fields.
 * - `tableName: 'TaskSubmissions'`: Database table name.
 * - `hooks.beforeCreate`: Adjusts `date` to the correct timezone before saving.
 */
const TaskSubmissions = sequelize.define(
  "TaskSubmissions",
  {
    submission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
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
    submission_complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "TaskSubmissions",
    timestamps: false,
    hooks: {
      beforeCreate: (taskSubmission, options) => {
        // Ajustar la fecha a la zona horaria correcta
        const currentDate = new Date();
        taskSubmission.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = TaskSubmissions;