const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Roles = require("./roles");
const Sede = require("./sede");
// const Cursos = require("./cursos");

const Usuarios = sequelize.define("Usuarios",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    carnet: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    anioRegistro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: Roles,
        key: "rol_id",
      },
    },
    // curso_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: Cursos,
    //     key: "curso_id",
    //   },
    // },

  },
  {
    timestamps: false,
    tableName: "Usuarios",
  }
);

module.exports = Usuarios;
