const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");

/**
 * Model `TaskSubmissions` - entregas de tareas por estudiantes.
 *
 * NORMALIZACIÓN: file_path ampliado a STRING(500). UNIQUE(user_id, task_id) en migración.
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
      references: { model: User, key: "user_id" },
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Task, key: "task_id" },
    },
    submission_complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tasksubmissions",
    timestamps: false,
    hooks: {
      beforeCreate: (taskSubmission, options) => {
        const currentDate = new Date();
        taskSubmission.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = TaskSubmissions;