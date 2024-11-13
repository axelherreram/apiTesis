const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 

const rolComision = sequelize.define(
  "rolComision",
  {
    rol_comision_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rolComisionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "rolComision",
  }
);

module.exports = rolComision;
