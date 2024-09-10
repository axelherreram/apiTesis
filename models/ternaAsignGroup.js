const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 
const User = require("./user");
const groupTerna = require("./groupTerna");
const rolTerna = require("./rolTerna");

const ternaAsignGroup = sequelize.define(
  "ternaAsignGroup",
  {
    ternaAsignGroup_id: {
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
    rolTerna_id: {
      type: DataTypes.INTEGER,
      references: {
        model: rolTerna,
        key: "rolTerna_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "ternaAsignGroup",
  }
);

module.exports = ternaAsignGroup;
