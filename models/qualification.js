const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 
// const Cursos = require("./cursos");
// const Tareas = require("./tareas");

const User = require("./user");
const Submissions = require("./submissions");

const Qualification = sequelize.define(
  "qualification",
  {
    qualification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // curso_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: Cursos,
    //     key: "curso_id",
    //   },
    // },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    cycle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Submissions,
        key: "submission_id",
      }
    },
    // tarea_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references:{
    //     model: Tareas,
    //     key: "tarea_id"
    //   }
    // },
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
    tableName: "qualification",
  }
);

module.exports = Qualification;
