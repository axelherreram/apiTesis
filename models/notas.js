const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cursos = require("./cursos");
const Usuarios = require("./usuarios");
const Ciclos = require("./ciclos");

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
    ciclo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ciclos,
        key: "ciclo_id",
      },
    },
    parcial: {
      type: DataTypes.NUMBER(5, 2),
      allowNull: false,
    },
    act_final: {
      type: DataTypes.NUMBER(5, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.NUMBER(5, 2),
      allowNull: false,
    },
    total_letras: {
      type: DataTypes.STRING,
      allowNull: false,
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
