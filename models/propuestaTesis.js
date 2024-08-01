const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  },
  {
    timestamps: false,
    tableName: "PropuestaTesis",
  }
);

module.exports = PropuestaTesis;
