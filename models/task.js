const { DataTypes } = require("sequelize");
const typeTask = require("./typeTask");
const { sequelize } = require("../config/database");
const Year = require("./year");
const CourseSedeAssignment = require("./courseSedeAssignment");

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
      type: DataTypes.STRING(255),
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
    tableName: "Task",
  }
);

module.exports = Task;
