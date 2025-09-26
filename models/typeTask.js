const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * Model `typeTask` represents different types of tasks or assignments.
 * 
 * Fields:
 * - `typeTask_id`: Unique identifier for the task type (Primary Key, auto-increment).
 * - `name`: Name of the task type (Unique, required).
 * 
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` or `updatedAt` fields.
 * - `tableName: 'typeTask'`: Database table name.
 */
const typeTask = sequelize.define(
  "typeTask",
  {
    typeTask_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
    tableName: "typetask",
  }
);

module.exports = typeTask;
