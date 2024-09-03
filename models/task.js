const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Course = require("./course");
const Sedes = require("./sede");
const typeTask = require("./typeTask");

const Task = sequelize.define(
  "Task",
  {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: "course_id",
      },
    },
    sede_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sedes,
        key: "sede_id",
      },
    },
    typeTask_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: typeTask,
        key: "typeTask_id",
      }
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
      allowNull: true,
    },
    endTask: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "Task",
  }
);

module.exports = Task;
