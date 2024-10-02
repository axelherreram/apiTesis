const { sequelize } = require("../config/database");
const groupTerna = require("./groupTerna");
const User = require("./user");
const { DataTypes } = require("sequelize");

const TernaAsignStudent = sequelize.define(
  "ternaAsignStudent",
  {
    ternaAsignStudent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupTerna_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: groupTerna,
        key: "groupTerna_id",
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "ternaAsignStudent",
  }
);

module.exports =  TernaAsignStudent ;
