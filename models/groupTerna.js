const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 
const Sede = require("./sede");
const Year = require("./year");

const groupTerna = sequelize.define(
  "groupTerna",
  {
    groupTerna_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sede_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    year_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Year,
        key: "year_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "groupTerna",
  }
);

module.exports = groupTerna;
