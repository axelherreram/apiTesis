const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cursos = require("./cursos");

const Tareas = sequelize.define(
  "Tareas",
  {
    tarea_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    curso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cursos,
        key: "curso_id",
      },
    },

    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    inicioTarea: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finTarea: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "Tareas",
  }
);

module.exports = Tareas;
