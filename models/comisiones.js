const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const rolComision = require("./rolComision");
const User = require("./user");
const GroupComision = require("./groupComision");

/**
 * Model `Comisiones` represents the roles assigned to users within a commission group.
 *
 * Fields:
 * - `comision_id`: Unique identifier for the commission entry (PK, auto-increment).
 * - `group_id`: ID of the group to which the commission is associated (FK to `GroupComision`, required).
 * - `user_id`: ID of the user assigned to the commission (FK to `User`, required).
 * - `rol_comision_id`: ID of the commission role assigned to the user (FK to `rolComision`, required).
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `year_id` (transitivo via group_id -> groupcomision.year_id).
 * - UNIQUE compuesto (group_id, user_id, rol_comision_id) definido en migración.
 *
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "comisiones"`: Database table name.
 */
const Comisiones = sequelize.define(
  "comisiones",
  {
    comision_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GroupComision,
        key: "group_id",
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
  },
  {
    timestamps: false,
    tableName: "comisiones",
  }
);

module.exports = Comisiones;
