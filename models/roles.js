const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");  

/**
 * Model `Roles` represents different user roles in the system (e.g., "Admin", "User", etc.).
 * 
 * Fields:
 * - `rol_id`: Unique identifier for the role (Primary Key, auto-increment).
 * - `name`: Name of the role (e.g., "Admin", "User").
 * 
 * Configuration:
 * - `timestamps: false`: No automatic creation of `createdAt` or `updatedAt` fields.
 * - `tableName: 'Roles'`: The table in the database where this model is stored (`Roles`).
 */
const Roles = sequelize.define("Roles", {
  rol_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'roles'
});

module.exports = Roles;
