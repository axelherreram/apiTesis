const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./usuarios");
const Sede = require("./sede");

const BitacoraApp = sequelize.define(
  "BitacoraApp",
  {
    bitacora_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "user_id",
      },
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    usuario: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    accion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    detalles: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "BitacoraApp",
  }
);

module.exports = BitacoraApp;
