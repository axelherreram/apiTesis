const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuarios = require("./usuarios");
const Tareas = require("./tareas");

const PropuestaTesis = sequelize.define(
  "PropuestaTesis",
  {
    propuesta_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    propuesta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "user_id",
      },
    },
    tarea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: Tareas,
        key: "tarea_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "PropuestaTesis",
  }
);

module.exports = PropuestaTesis;
