const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const rolComision = require("./rolComision");
const User = require("./user");
const Year = require("./year");
const GroupComision = require("./groupComision");

/**
 * Model `Comisiones` represents the commissions or roles assigned to users within a specific year and group.
 * 
 * Fields:
 * - `comision_id`: Unique identifier for the commission entry (PK, auto-increment).
 * - `year_id`: ID of the year associated with the commission (FK to `Year`, required).
 * - `user_id`: ID of the user assigned to the commission (FK to `User`, required).
 * - `rol_comision_id`: ID of the commission role assigned to the user (FK to `rolComision`, required).
 * - `group_id`: ID of the group to which the commission is associated (FK to `GroupComision`, required).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "comisiones"`: Database table name (`comisiones`).
 * 
 * Relationships:
 * - `belongsTo(Year, { foreignKey: "year_id" })`: A commission belongs to a year.
 * - `belongsTo(User, { foreignKey: "user_id" })`: A commission is assigned to a user.
 * - `belongsTo(rolComision, { foreignKey: "rol_comision_id" })`: A commission has a specific role assigned.
 * - `belongsTo(GroupComision, { foreignKey: "group_id" })`: A commission belongs to a group.
 */
const Comisiones = sequelize.define(
  "comisiones",
  {
    comision_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    year_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Year,
        key: "year_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    rol_comision_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: rolComision,
        key: "rol_comision_id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GroupComision,
        key: "group_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "comisiones",
  }
);

module.exports = Comisiones;
