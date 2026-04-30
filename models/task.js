const { DataTypes } = require("sequelize");
const typeTask = require("./typeTask");
const { sequelize } = require("../config/database");
const CourseSedeAssignment = require("./courseSedeAssignment");

/**
 * Model `Task` represents a task assigned to a specific course in the system.
 *
 * Fields:
 * - `task_id`: Unique identifier for the task (Primary Key, auto-increment).
 * - `asigCourse_id`: Reference to the assigned course (`CourseSedeAssignment` model).
 * - `typeTask_id`: Reference to the type of task (`typeTask` model).
 * - `title`: Title of the task (Cannot be null).
 * - `description`: A short description of the task (Cannot be null).
 * - `taskStart`: Start date-time of the task (DATETIME, cannot be null).
 * - `endTask`: End date-time of the task (DATETIME, cannot be null).
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `year_id` (transitivo via asigCourse_id -> coursesedeassignment.year_id).
 * - Eliminados `startTime` y `endTime` (consolidados en DATETIME).
 *
 * Configuration:
 * - `timestamps: false`: No automatic creation of `createdAt` or `updatedAt` fields.
 * - `tableName: 'task'`: The table in the database where this model is stored.
 */
const Task = sequelize.define(
  "Task",
  {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    asigCourse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CourseSedeAssignment,
        key: "asigCourse_id",
      },
    },
    typeTask_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: typeTask,
        key: "typeTask_id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    taskStart: {
      // Sequelize v6: DATE = DATETIME en MySQL (incluye fecha + hora)
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTask: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "task",
  }
);

module.exports = Task;
