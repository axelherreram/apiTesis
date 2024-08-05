const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cursos = require("./cursos");
const Usuarios = require("./usuarios");
const Tareas = require("./tareas");

const Notas = sequelize.define(
  "Notas",
  {
    nota_id: {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "user_id",
      },
    },
    ciclo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tarea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: Tareas,
        key: "tarea_id"
      }
    },

    parcial: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    act_final: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    total_letras: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Notas",
  }
);

module.exports = Notas;
