const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 

/**
 * Model `rolComision` represents the different roles within a commission.
 * 
 * Fields:
 * - `rol_comision_id`: Unique identifier for the commission role (PK, auto-increment).
 * - `rolComisionName`: Name of the role within the commission (e.g., "Student", "Teacher", etc.).
 * 
 * Configuration:
 * - `timestamps: false`: No automatic creation of `createdAt` or `updatedAt` fields.
 * - `tableName: 'rolComision'`: Database table name (`rolComision`).
 */
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
    tableName: "rolcomision",
  }
);

module.exports = rolComision;
