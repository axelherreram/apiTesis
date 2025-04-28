const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * Model `Year` represents an academic year in the system.
 * 
 * Fields:
 * - `year_id`: Unique identifier for the year (Primary Key, auto-increment).
 * - `year`: The year itself (Required, must be unique).
 * 
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` or `updatedAt` fields.
 * - `tableName: 'year'`: Database table name.
 * 
 * Associations:
 * - There are no direct associations defined in this model.
 */
const Year = sequelize.define(
  "Year",
  {
    year_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
    tableName: "year",
  }
);

module.exports = Year;
