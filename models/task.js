const { DataTypes } = require("sequelize");
const typeTask = require("./typeTask");
const { sequelize } = require("../config/database");
const Year = require("./year");
const CourseSedeAssignment = require("./courseSedeAssignment");

/**
 * Model `Task` represents a task assigned to a specific course and group in the system.
 * 
 * Fields:
 * - `task_id`: Unique identifier for the task (Primary Key, auto-increment).
 * - `asigCourse_id`: Reference to the assigned course (`CourseSedeAssignment` model).
 * - `typeTask_id`: Reference to the type of task (`typeTask` model).
 * - `title`: Title of the task (Cannot be null).
 * - `description`: A short description of the task (Cannot be null).
 * - `taskStart`: Start date of the task (Cannot be null).
 * - `endTask`: End date of the task (Cannot be null).
 * - `startTime`: Time when the task starts (Cannot be null).
 * - `endTime`: Time when the task ends (Cannot be null).
 * - `year_id`: Reference to the academic year (`Year` model).
 * 
 * Configuration:
 * - `timestamps: false`: No automatic creation of `createdAt` or `updatedAt` fields.
 * - `tableName: 'Task'`: The table in the database where this model is stored (`Task`).
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTask: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    year_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Year,
        key: "year_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "task",
  }
);

module.exports = Task;
