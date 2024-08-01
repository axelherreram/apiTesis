const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuarios = require("./usuarios");

const PropuestaTesis = sequelize.define(
  "PropuestaTesis",
  {
    propuesta_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    propuesta: {
      type: DataTypes.STRING,
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
  },
  {
    timestamps: false,
    tableName: "PropuestaTesis",
  }
);

module.exports = PropuestaTesis;
