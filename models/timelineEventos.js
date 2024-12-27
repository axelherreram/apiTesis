const { DataTypes } = require("sequelize");
const User = require("./user");
const { sequelize } = require('../config/database'); 
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'TimelineEventos',
  hooks: {
    beforeCreate: (timelineEvento, options) => {
      // Ajustar la fecha a la zona horaria correcta
      const currentDate = new Date();
      timelineEvento.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
    },
  },
});

module.exports = TimelineEventos;