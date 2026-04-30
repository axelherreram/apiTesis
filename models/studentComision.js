const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const GroupComision = require("./groupComision");

/**
 * Model `studentComision` represents the assignment of a student to a commission group.
 *
 * Fields:
 * - `estudiante_comision_id`: Unique identifier for the assignment (PK, auto-increment).
 * - `group_id`: FK referencing `GroupComision`, representing the commission group.
 * - `user_id`: FK referencing `User`, representing the student.
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `year_id` (transitivo via group_id -> groupcomision.year_id).
 * - UNIQUE compuesto (group_id, user_id) definido en migración.
 *
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: 'studentcomision'`: Database table name.
 */
const studentComision = sequelize.define(
  "studentComision",
  {
    estudiante_comision_id: {
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
  },
  {
    timestamps: false,
    tableName: "studentcomision",
  }
);

module.exports = studentComision;