const { DataTypes } = require("sequelize");
const User = require("./user");
const { sequelize } = require('../config/database'); 
const Course = require("./course");
const Task = require("./task");


const TimelineEventos = sequelize.define("TimelineEventos", {
  evento_id: {
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
  tipoEvento: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: "course_id",
    },
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Task,
      key: "task_id",
    },
  },
  fecha:{
    type: DataTypes.DATE,
    allowNull: false,
  },

},{
    timestamps: false,
    tableName: 'TimelineEventos'
}
);

module.exports = TimelineEventos;