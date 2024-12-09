const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");

// Modelo para Task Submissions
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    date_init: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "TaskSubmissions",
    timestamps: false,
  }
);

module.exports = TaskSubmissions;
