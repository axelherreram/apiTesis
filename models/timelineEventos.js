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
  typeEvent: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Task,
      key: "task_id",
    },
  },
  date:{
    type: DataTypes.DATE,
    allowNull: false,
  },

},{
    timestamps: false,
    tableName: 'TimelineEventos'
}
);

module.exports = TimelineEventos;