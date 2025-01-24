const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Year = require("./year");
const Sede = require("./sede");

/**
 * Model `GroupComision` represents a group within a commission for a specific year and sede.
 * 
 * Fields:
 * - `group_id`: Unique identifier for the group within a commission (PK, auto-increment).
 * - `year_id`: Foreign key referencing the `Year` model, representing the academic year in which the group is active.
 * - `sede_id`: Foreign key referencing the `Sede` model, representing the sede to which the group belongs.
 * - `activeGroup`: Boolean indicating whether the group is active, defaulting to `true`.
 * 
 * Configuration:
 * - `timestamps: true`: Automatically creates `createdAt` and `updatedAt` fields.
 * - `tableName: 'groupComision'`: Database table name (`groupComision`).
 */
const GroupComision = sequelize.define(
  "groupComision",
  {
    group_id: {
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
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    activeGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "groupComision",
  }
);



module.exports = GroupComision;
