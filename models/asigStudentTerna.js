const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 
const groupTerna = require("./groupTerna");
const User = require("./user");
const Year = require("./year");

const asigStudentTerna = sequelize.define(
  "asigStudentTerna",
  {
    asigStudentTerna_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
    },
    groupTerna_id: {
      type: DataTypes.INTEGER,
      references: {
        model: groupTerna,
        key: "groupTerna_id",
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
    tableName: "asigStudentTerna",
  }
);

module.exports = asigStudentTerna;
