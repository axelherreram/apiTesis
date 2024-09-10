const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 

const rolTerna = sequelize.define(
  "rolTerna",
  {
    rolTerna_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rolTernaName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "rolTerna",
  }
);

module.exports = rolTerna;
